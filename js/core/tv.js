/*
 * TV Simulator '99
 * @Author: zshall 
 * @Date: 2017-05-02 22:34:58 
 * @Last Modified by: zshall
 * @Last Modified time: 2017-05-03 00:31:21
 */

 class TV {
    constructor(maxWidth = 1200, maxHeight = 1000, warmupTime = 3000, firstStart = true) {
        this.maxWidth = maxWidth;
        this.maxHeight = maxHeight;
        this.warmupTime = warmupTime;
        this.firstStart = firstStart;
        this.classes = {
            Channel12
		};
    }

    startUp() {
        $(document).ready(() => {
            if( !Helpers.isMobile().any() ){
                $(window).resize(() => {
                    this.handleResize();
                });
                $('.screen').addClass('scanlines');
            }
        
            this.handleResize();
            
            // about
            $('#about-button').click(() => {
                $('.about').toggle();
            })
            $('.about').toggle();
        
            // other TV buttons
            $('#tv-mute').click(() => {
                this.toggleMute();
			});
			var mSelf = this;
            $.ajax({
				//url: "https://api.twitch.tv/kraken/streams/featured",
				url: "twitch.json",
				//url: "data/guide.xml",
				headers: {"Accept": "application/vnd.twitchtv.v5+json", "Client-ID": "***REMOVED***"},
				success: function(response){mSelf.getTwitch(mSelf, response);}
			});
        	YouTubeApi.loadYouTubeAPI();
        });
        
     }

    showChannel(number, callback) {
        if (this.channel) {
            this.channel.teardown();
        }

        $('#tvm-top-right').css('opacity', '0');
        $('.current-channel').css('opacity', '0').attr('id', `ch-${number}`).load(`channels/${Helpers.padLeft(number, 3)}/layout.html`, () => {
            this.channel = new this.classes['Channel' + number]($('.current-channel'), window.guideData);
            this.channel.show();
            $('.current-channel, #tvm-top-right').animate({opacity: 1}, this.firstStart ? this.warmupTime : this.warmupTime / 10, 0, () => {
                this.channel.ready();
            });
            $('#tvm-top-right').text(Helpers.padLeft(number, 2));
            setTimeout(() => {
                $('#tvm-top-right').text('');
            }, 4000);
            this.firstStart = false;
        });
    }

    toggleMute() {
        this.muted = YouTubeApi.toggleMuteVideo(this.channel.player);
        this.afterMute();
    }

    unmute() {
        this.toggleMute(false);
        this.afterMute();
    }

    mute() {
        this.toggleMute(true);
        this.afterMute();
    }

    afterMute() {
        if (this.muted) {
            $('#tvm-bottom-left').text('MUTING');
        } else {
            $('#tvm-bottom-left').text('');
        }
    }

    // http://stackoverflow.com/a/18751691/970180
    handleResize() {
        let $window = $(window);
        let width = $window.width();
        let height = $window.height();
        let scale;

        // early exit
        if(width >= this.maxWidth && this.height >= this.maxHeight) {
            $('.tv').css({'transform': ''});
            return;
        }

        scale = Math.min(width/this.maxWidth, height/this.maxHeight);

        $('.tv').css({'transform': 'scale(' + scale + ')'});
	}
	getTwitch(mSelf, json){
		let twitch = []; let i;
		twitch = json["featured"];
		let xml = `<?xml version="1.0" encoding="UTF-8" standalone="yes" ?>
		<!-- TV Simulator '99 - Zach Hall, 2017 -->
		<guide>
		<videos>
			<video id="oemoqEuJdFE" />
		</videos>
		<ads>
			<ad duration="7">
				<p>Get up to 12 Months of Nintendo Switch Online</p>
				<p>Included in your Twitch Prime subscription</p>
			</ad>
			<ad duration="7">
				<p>Prevue Guide</p>
				<p>We are what's on</p>
			</ad>
			<ad duration="7">
				<p>Twitch.TV</p>
				<p>Your number one destination for livestreaming</p>
			</ad>
			<ad duration="7">
				<p>Overwatch League<br />All-Access Pass</p>
				<p>The best way to watch<br />the Overwatch League</p>
			</ad>
		</ads>
		`
		for(i = 0; i<twitch.length; i++){
			console.log(twitch[i]["stream"]["channel"]["mature"]);
			xml += `<channel number="${i}" name="${twitch[i]["stream"]["channel"]["display_name"].split("_")[0].substring(0,6).toUpperCase()}">`
			if(twitch[i]["stream"]["channel"]["game"] == "Just Chatting"){
				xml += `<listing timeslot="19" type="1" data2="22" data3="7" data4="0">${twitch[i]["text"].replace("<p>","").replace("</p>","")} </listing></channel>`; //Headphone Symbol
				console.log(i);
				continue;
			}
			//If stream has no description, just do short listing
			if(twitch[i]["text"].replace("<p>","").replace("</p>","") == ""){
				xml += `<listing timeslot="19" type="1" data2="22" data3="7" data4="0">${twitch[i]["stream"]["game"]}</listing><listing timeslot="20" type="1" data2="22" data3="7" data4="0"></listing></channel>`;
				continue;
			}
			switch(Math.floor(Math.random()*4)){
				case 0:
					// Game - Description
					xml += `<listing timeslot="19" type="1" data2="22" data3="7" data4="0">${twitch[i]["stream"]["game"]} - ${twitch[i]["text"].replace("<p>","").replace("</p>","")}</listing></channel>`;
					break;
				case 1:
					// Game - Description rating
					xml += `<listing timeslot="19" type="1" data2="22" data3="7" data4="0">${twitch[i]["stream"]["game"]} - ${twitch[i]["text"].replace("<p>","").replace("</p>","")} ${twitch[i]["stream"]["channel"]["mature"] ? "" : ""}</listing></channel>`;
					break;
				case 2:
					// Game
					xml += `<listing timeslot="19" type="1" data2="22" data3="7" data4="0">${twitch[i]["stream"]["game"]}</listing><listing timeslot="20" type="1" data2="22" data3="7" data4="0"></listing></channel>`;
					break;
				case 3:
					// Game
					xml += `<listing timeslot="19" type="1" data2="22" data3="7" data4="0">${twitch[i]["stream"]["game"]}  ${twitch[i]["stream"]["channel"]["mature"] ? "" : ""}</listing><listing timeslot="20" type="1" data2="22" data3="7" data4="0"></listing></channel>`;
					break;
				default:
					break;
			}
		}
		xml += `</guide>`
		window.guideData = $($.parseXML(xml));
		console.log($.parseXML(xml));
		var defaultChannel = guideData.find('channel[watchable][default]').attr('number');
		mSelf.showChannel(12);
		if (undefined != defaultChannel && null != defaultChannel) {
			mSelf.showChannel(defaultChannel);
		} else {console.error("defaultChannel undefined");}
	}
}