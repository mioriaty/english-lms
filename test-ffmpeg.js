const ffmpeg = require('fluent-ffmpeg');
const cmd = ffmpeg('https://dummy.com/test.m3u8')
      .inputOptions([
        "-headers",
        `User-Agent: My-Agent\r\nReferer: https://my-ref.com\r\n`,
        "-protocol_whitelist",
        "file,http,https,tcp,tls,crypto",
      ])
      .toFormat("mp3");
      
cmd.on('start', function(commandLine) {
    console.log('Spawned Ffmpeg with command: ' + commandLine);
});
cmd.outputOptions('-f', 'null');
cmd.output('/dev/null');
cmd.run();
