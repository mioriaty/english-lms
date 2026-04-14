"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/libs/components/ui/dialog";
import { Button } from "@/libs/components/ui/button";
import { useState } from "react";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/libs/components/ui/tabs";
import { AspectRatio } from "@/libs/components/ui/aspect-ratio";
import { TypoP } from "@/libs/components/typography/paragraph";
import Link from "next/link";
import { TypoH4 } from "@/libs/components/typography/h4";
import { TypoH3 } from "@/libs/components/typography/h3";

type DownloadGuideTab = "m3u8" | "mp3";

export const DownloadGuideDialog = () => {
  const [tab, setTab] = useState<DownloadGuideTab>("m3u8");

  const handleTabChange = (val: string) => {
    const newTab = val as DownloadGuideTab;
    setTab(newTab);
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button
          size="lg"
          variant="link"
          className="uppercase underline cursor-pointer"
        >
          Cách tải file audio từ British Council
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-2xl">Hướng dẫn</DialogTitle>
        </DialogHeader>

        <Tabs
          value={tab}
          onValueChange={handleTabChange}
          className="flex-1 flex flex-col min-h-0"
        >
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="m3u8">Những file dạng video</TabsTrigger>
            <TabsTrigger value="mp3">Những file dạng audio mp3</TabsTrigger>
          </TabsList>

          <div className="no-scrollbar max-h-[50vh] overflow-y-auto">
            <TabsContent value="m3u8">
              <AspectRatio ratio={16 / 9}>
                <iframe
                  src="https://player.cloudinary.com/embed/?cloud_name=djr0mgrkf&public_id=Screen_Recording_2026-04-13_at_22.38.08_oer3ll"
                  width="100%"
                  height="100%"
                  allow="autoplay; fullscreen; encrypted-media; picture-in-picture"
                  allowFullScreen
                  className="w-full h-full border-0"
                />
              </AspectRatio>

              <TypoP>
                Link audio ví dụ:
                <Link
                  href="https://takeielts.britishcouncil.org/take-ielts/prepare/free-ielts-english-practice-tests/listening/section-1"
                  target="_blank"
                  className="text-blue-500 underline"
                >
                  Link
                </Link>
              </TypoP>

              <TypoH3>Đối với các audio là dạng video thì làm như sau:</TypoH3>

              <ul className="my-6 ml-6 list-disc [&>li]:mt-2">
                <li>
                  <TypoP>
                    Click chuột phải vào trang web để nó hiện lên 1 cái panel.
                  </TypoP>
                </li>

                <li>
                  <TypoP>
                    Chọn <strong>Inspect</strong>.
                  </TypoP>
                </li>
                <li>
                  <TypoP>
                    Sau đó nó sẽ hiện ra 1 dialog, chọn tab{" "}
                    <strong>Network</strong>.
                  </TypoP>
                </li>

                <li>
                  <TypoP>
                    Dưới tab <strong>Network</strong> sẽ có 1 tab con là{" "}
                    <strong>Fetch/XHR</strong>, chọn <strong>Fetch/XHR</strong>.
                  </TypoP>
                </li>

                <li>
                  <TypoP>
                    Bấm play video, lúc này nó sẽ ra 1 đống link, tìm link nào
                    có đuôi là <strong>.m3u8</strong>. (thường là index.m3u8)
                  </TypoP>
                </li>

                <li>
                  <TypoP>
                    Chọn link có đuôi là <strong>.m3u8</strong>, rồi sẽ thấy
                    Request URL, copy URL đó.
                  </TypoP>
                </li>

                <li>
                  <TypoP>
                    Sau đó quay trở về web của mình và paste cái link đó vào ô
                    input rồi bấm convert.
                  </TypoP>
                </li>
              </ul>
            </TabsContent>

            <TabsContent value="mp3">
              <AspectRatio ratio={16 / 9}>
                <iframe
                  src="https://player.cloudinary.com/embed/?cloud_name=djr0mgrkf&public_id=Screen_Recording_2026-04-08_at_17.26.33_uvsv57"
                  width="100%"
                  height="100%"
                  allow="autoplay; fullscreen; encrypted-media; picture-in-picture"
                  allowFullScreen
                  className="w-full h-full border-0"
                />
              </AspectRatio>

              <TypoP>
                Link audio ví dụ:
                <Link
                  href="https://learnenglish.britishcouncil.org/free-resources/listening/a1/request-your-boss"
                  target="_blank"
                  className="text-blue-500 underline"
                >
                  Link
                </Link>
              </TypoP>

              <TypoH3>
                Đối với các audio khi bấm vào icon 3 chấm không có download thì
                làm như sau:
              </TypoH3>

              <ul className="my-6 ml-6 list-disc [&>li]:mt-2">
                <li>
                  <TypoP>
                    Click chuột phải vào trang web để nó hiện lên 1 cái panel.
                  </TypoP>
                </li>
                <li>
                  <TypoP>
                    Chọn <strong>Inspect</strong>.
                  </TypoP>
                </li>
                <li>
                  <TypoP>
                    Sau đó nó sẽ hiện ra 1 dialog, chọn tab{" "}
                    <strong>Network</strong>.
                  </TypoP>
                </li>
                <li>
                  <TypoP>
                    Dưới tab Network sẽ có 1 tab con là <strong>Media</strong>,
                    chọn <strong>Media</strong>.
                  </TypoP>
                </li>

                <li>
                  <TypoP>
                    Bấm reload loại lại trang web sẽ thấy các source file mp3,
                    bấm click 2 lần vào cái mp3 với tiêu đề của bài thi.
                  </TypoP>
                </li>

                <li>
                  <TypoP>
                    Lúc này nó sẽ mở ra 1 web với file audio có chữ download.
                  </TypoP>
                </li>
              </ul>
            </TabsContent>
          </div>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};
