"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import { restrictToVerticalAxis } from "@dnd-kit/modifiers";
import {
  SortableContext,
  arrayMove,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { Button } from "@/libs/components/ui/button";
import type { Question, QuestionType } from "@/core/lms/domain/question.types";
import {
  newLeafDraft,
  newGroupDraft,
  draftToQuestion,
  type DraftQuestion,
} from "./_question-builder/types";
import { QuestionCard } from "./_question-builder/question-card";

interface QuestionBuilderProps {
  onQuestionsChange: (questions: Question[]) => void;
  initialQuestions?: Question[];
}

function initDrafts(initialQuestions?: Question[]): DraftQuestion[] {
  if (!initialQuestions || initialQuestions.length === 0)
    return [newLeafDraft()];

  return initialQuestions.map((q): DraftQuestion => {
    if (q.type === "GROUP") {
      return {
        id: q.id,
        type: "GROUP",
        questionText: q.question.text,
        description: q.question.description ?? "",
        audioUrl: q.question.audio,
        imageUrl: q.question.image ?? null,
        subQuestions: q.subQuestions.map((sub) => ({
          id: sub.id,
          type: sub.type,
          questionText: sub.question.text,
          description: sub.question.description ?? "",
          audioUrl: sub.question.audio,
          imageUrl: sub.question.image ?? null,
          options: sub.type === "MULTIPLE_CHOICE" ? sub.options : [],
          correct: sub.type === "MULTIPLE_CHOICE" ? sub.correct : [],
          fillBlanks: sub.type === "FILL_IN_THE_BLANK" ? sub.correct : [],
          explain: sub.explain ?? "",
        })),
      };
    }
    return {
      id: q.id,
      type: q.type,
      questionText: q.question.text,
      description: q.question.description ?? "",
      audioUrl: q.question.audio,
      imageUrl: q.question.image ?? null,
      options: q.type === "MULTIPLE_CHOICE" ? q.options : [],
      correct: q.type === "MULTIPLE_CHOICE" ? q.correct : [],
      fillBlanks: q.type === "FILL_IN_THE_BLANK" ? q.correct : [],
      explain: q.explain ?? "",
    };
  });
}

export function QuestionBuilder({
  onQuestionsChange,
  initialQuestions,
}: QuestionBuilderProps) {
  const [drafts, setDrafts] = useState<DraftQuestion[]>(() =>
    initDrafts(initialQuestions)
  );

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } })
  );

  function setDraftsAndNotify(
    updater: (prev: DraftQuestion[]) => DraftQuestion[]
  ) {
    setDrafts((prev) => {
      const next = updater(prev);
      onQuestionsChange(next.map(draftToQuestion));
      return next;
    });
  }

  function updateDraft(index: number, d: DraftQuestion) {
    setDraftsAndNotify((prev) =>
      prev.map((item, i) => (i === index ? d : item))
    );
  }

  function deleteDraft(index: number) {
    setDraftsAndNotify((prev) => prev.filter((_, i) => i !== index));
  }

  function addQuestion(type: QuestionType) {
    setDraftsAndNotify((prev) => [...prev, newLeafDraft(type)]);
  }

  function addGroup() {
    setDraftsAndNotify((prev) => [...prev, newGroupDraft()]);
  }

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      setDraftsAndNotify((prev) => {
        const oldIndex = prev.findIndex((d) => d.id === active.id);
        const newIndex = prev.findIndex((d) => d.id === over.id);
        return arrayMove(prev, oldIndex, newIndex);
      });
    }
  }

  return (
    <div className="min-w-0 space-y-4">
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        modifiers={[restrictToVerticalAxis]}
        onDragEnd={handleDragEnd}
      >
        <SortableContext
          items={drafts.map((d) => d.id)}
          strategy={verticalListSortingStrategy}
        >
          <div className="space-y-3">
            {drafts.map((draft, i) => (
              <QuestionCard
                key={draft.id}
                draft={draft}
                index={i}
                onChange={(d) => updateDraft(i, d)}
                onDelete={() => deleteDraft(i)}
              />
            ))}
          </div>
        </SortableContext>
      </DndContext>

      <div className="flex flex-wrap gap-2">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => addQuestion("MULTIPLE_CHOICE")}
        >
          <Plus className="mr-1.5 h-4 w-4" />
          Add Multiple Choice
        </Button>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => addQuestion("FILL_IN_THE_BLANK")}
        >
          <Plus className="mr-1.5 h-4 w-4" />
          Add Fill in the Blank
        </Button>
        <Button type="button" variant="outline" size="sm" onClick={addGroup}>
          <Plus className="mr-1.5 h-4 w-4" />
          Add Group
        </Button>
      </div>
    </div>
  );
}
