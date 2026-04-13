const ffmpeg = require('fluent-ffmpeg');
const ffmpegStatic = require('ffmpeg-static');
ffmpeg.setFfmpegPath(ffmpegStatic);

const cmd = ffmpeg('https://cfvod.kaltura.com/hls/p/5394802/sp/539480200/serveFlavor/entryId/1_p3x3lbo7/v/1/ev/3/flavorId/1_3p67te1m/name/a.mp4/index.m3u8')
      .inputOptions([
        "-v", "debug",
        "-user_agent", "Mozilla/5.0",
        "-protocol_whitelist", "file,http,https,tcp,tls,crypto",
      ])
      .toFormat("mp3");
      
cmd.on('error', function(err) {
    console.log('Error: ' + err.message);
});
cmd.on('end', function() {
    console.log('Finished');
});
cmd.outputOptions('-f', 'null');
cmd.output('/dev/null');
cmd.run();
