const { MessageEmbed } = require('discord.js');
const { Command } = require('discord.js-commando');

const { color } = require('../../config.json');

module.exports = class NowPlayingCommand extends Command {
  constructor(client) {
    super(client, {
      name: 'nowplaying',
      group: 'musik',
      memberName: 'nowplaying',
      aliases: ['np', 'currently-playing', 'now-playing'],
      guildOnly: true,
      description: 'Anzeige des aktuellen Songs!'
    });
  }

  run(message) {
    if (
      (!message.guild.musicData.isPlaying &&
        !message.guild.musicData.nowPlaying) ||
      message.guild.triviaData.isTriviaRunning
    ) {
      return message.say(
        ':no_entry: Bitte betrete einen Sprachkanal und versuche es erneut!'
      );
    }

    const video = message.guild.musicData.nowPlaying;
    let description;
    if (video.duration == 'Livestream') {
      description = ':red_circle: Livestream';
    } else {
      description = NowPlayingCommand.playbackBar(message, video);
    }

    const title = message.guild.musicData.loopSong
      ? `:repeat: ${video.title} **auf Repeat**`
      : video.title;

    const videoEmbed = new MessageEmbed()
      .setThumbnail(video.thumbnail)
      .setColor(color)
      .setTitle(`:notes: ${title}`)
      .setURL(video.url)
      .setDescription(description);
    message.channel.send(videoEmbed);
    return;
  }
  static playbackBar(message, video) {
    const passedTimeInMS = message.guild.musicData.songDispatcher.streamTime;
    const passedTimeInMSObj = {
      seconds: Math.floor((passedTimeInMS / 1000) % 60),
      minutes: Math.floor((passedTimeInMS / (1000 * 60)) % 60),
      hours: Math.floor((passedTimeInMS / (1000 * 60 * 60)) % 24)
    };
    const passedTimeFormatted = NowPlayingCommand.formatDuration(
      passedTimeInMSObj
    );

    const totalDurationObj = video.rawDuration;
    const totalDurationFormatted = NowPlayingCommand.formatDuration(
      totalDurationObj
    );

    let totalDurationInMS = 0;
    Object.keys(totalDurationObj).forEach(function(key) {
      if (key == 'hours') {
        totalDurationInMS = totalDurationInMS + totalDurationObj[key] * 3600000;
      } else if (key == 'minutes') {
        totalDurationInMS = totalDurationInMS + totalDurationObj[key] * 60000;
      } else if (key == 'seconds') {
        totalDurationInMS = totalDurationInMS + totalDurationObj[key] * 100;
      }
    });
    const playBackBarLocation = Math.round(
      (passedTimeInMS / totalDurationInMS) * 10
    );
    let playBack = '';
    for (let i = 1; i < 21; i++) {
      if (playBackBarLocation == 0) {
        playBack = ':musical_note:▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬';
        break;
      } else if (playBackBarLocation == 10) {
        playBack = '▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬:musical_note:';
        break;
      } else if (i == playBackBarLocation * 2) {
        playBack = playBack + ':musical_note:';
      } else {
        playBack = playBack + '▬';
      }
    }
    playBack = `${passedTimeFormatted}  ${playBack}  ${totalDurationFormatted}`;
    return playBack;
  }
  // prettier-ignore
  static formatDuration(durationObj) {
      const duration = `${durationObj.hours ? (durationObj.hours + ':') : ''}${
        durationObj.minutes ? durationObj.minutes : '00'
      }:${
        (durationObj.seconds < 10)
          ? ('0' + durationObj.seconds)
          : (durationObj.seconds
          ? durationObj.seconds
          : '00')
      }`;
      return duration;
    }
};
