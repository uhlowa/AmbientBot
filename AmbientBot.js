/**
 *Copyright 2015 Paradox VII
 */


(function () {

    API.getWaitListPosition = function(id){
        if(typeof id === 'undefined' || id === null){
            id = API.getUser().id;
        }
        var wl = API.getWaitList();
        for(var i = 0; i < wl.length; i++){
            if(wl[i].id === id){
                return i;
            }
        }
        return -1;
    };

    var kill = function () {
        clearInterval(ambient.room.autodisableInterval);
        clearInterval(ambient.room.afkInterval);
        ambient.status = false;
    };

    var storeToStorage = function () {
        localStorage.setItem("ambientsettings", JSON.stringify(ambient.settings));
        localStorage.setItem("ambientRoom", JSON.stringify(ambient.room));
        localStorage.setItem("monies", JSON.stringify(ambient.settings.monies));
        var ambientStorageInfo = {
            time: Date.now(),
            stored: true,
            version: ambient.version
        };
        localStorage.setItem("ambientStorageInfo", JSON.stringify(ambientStorageInfo));

    };

    var subChat = function (chat, obj) {
        if (typeof chat === "undefined") {
            API.chatLog("There is a chat text missing.");
            console.log("There is a chat text missing.");
            return "[Error] No text message found.";
        }
        if (chat !== null) {
        var lit = '%%';
        for (var prop in obj) {
            chat = chat.replace(lit + prop.toUpperCase() + lit, obj[prop]);
        }
        return chat;
        }
        return chat;
    };

    var loadChat = function (cb) {
        if (!cb) cb = function () {
        };

        $.get("https://rawgit.com/Paradox68/AmbientBot/master/lang/langIndex.json", function (json) {
            var link = ambient.chatLink;
            if (json !== null && typeof json !== "undefined") {
                langIndex = json;
                link = langIndex[ambient.settings.language.toLowerCase()];
                if (ambient.settings.chatLink !== ambient.chatLink) {
                    link = ambient.settings.chatLink;
                }
                else {
                    if (typeof link === "undefined") {
                        link = ambient.chatLink;
                    }
                }
                $.get(link, function (json) {
                    if (json !== null && typeof json !== "undefined") {
                        if (typeof json === "string") json = JSON.parse(json);
                        ambient.chat = json;
                        cb();
                    }
                });
            }
            else {
                $.get(ambient.chatLink, function (json) {
                    if (json !== null && typeof json !== "undefined") {
                        if (typeof json === "string") json = JSON.parse(json);
                        ambient.chat = json;
                        cb();
                    }
                });
            }
        });
    };

    var retrieveSettings = function () {
        var settings = JSON.parse(localStorage.getItem("ambientsettings"));
        if (settings !== null) {
            for (var prop in settings) {
                ambient.settings[prop] = settings[prop];
            }
        }
    };

    var retrieveFromStorage = function () {
        var info = localStorage.getItem("ambientStorageInfo");
        if (info === null) API.chatLog(ambient.chat.nodatafound);
        else {
            var settings = JSON.parse(localStorage.getItem("ambientsettings"));
            var room = JSON.parse(localStorage.getItem("ambientRoom"));
            var nmonies = JSON.parse(localStorage.getItem("monies"));
            var elapsed = Date.now() - JSON.parse(info).time;
            if ((elapsed < 1 * 60 * 60 * 1000)) {
                API.chatLog(ambient.chat.retrievingdata);
                for (var prop in settings) {
                    ambient.settings[prop] = settings[prop];
                }
                ambient.room.users = room.users;
                ambient.room.afkList = room.afkList;
                ambient.room.historyList = room.historyList;
                ambient.room.mutedUsers = room.mutedUsers;
                ambient.room.autoskip = room.autoskip;
                ambient.room.roomstats = room.roomstats;
                ambient.room.messages = room.messages;
                ambient.room.queue = room.queue;
                ambient.room.newBlacklisted = room.newBlacklisted;
                ambient.settings.monies = nmonies;
                API.chatLog(ambient.chat.datarestored);
            }
        }
        var json_sett = null;
        var roominfo = document.getElementById("room-settings");
        info = roominfo.textContent;
        var ref_bot = "@AmbientBot=";
        var ind_ref = info.indexOf(ref_bot);
        if (ind_ref > 0) {
            var link = info.substring(ind_ref + ref_bot.length, info.length);
            var ind_space = null;
            if (link.indexOf(" ") < link.indexOf("\n")) ind_space = link.indexOf(" ");
            else ind_space = link.indexOf("\n");
            link = link.substring(0, ind_space);
            $.get(link, function (json) {
                if (json !== null && typeof json !== "undefined") {
                    json_sett = JSON.parse(json);
                    for (var prop in json_sett) {
                        ambient.settings[prop] = json_sett[prop];
                    }
                }
            });
        }

    };

    String.prototype.splitBetween = function (a, b) {
        var self = this;
        self = this.split(a);
        for (var i = 0; i < self.length; i++) {
            self[i] = self[i].split(b);
        }
        var arr = [];
        for (var i = 0; i < self.length; i++) {
            if (Array.isArray(self[i])) {
                for (var j = 0; j < self[i].length; j++) {
                    arr.push(self[i][j]);
                }
            }
            else arr.push(self[i]);
        }
        return arr;
    };

    var linkFixer = function (msg) {
        var parts = msg.splitBetween('<a href="', '<\/a>');
        for (var i = 1; i < parts.length; i = i + 2) {
            var link = parts[i].split('"')[0];
            parts[i] = link;
        }
        var m = '';
        for (var i = 0; i < parts.length; i++) {
            m += parts[i];
        }
        return m;
    };

    var botCreator = "Connor (Paradox)";
    var botMaintainer = "AmbientBot"
    var botCreatorIDs = ["3995934", "4105209"];

    var ambient = {
        version: "1.0.1",
        status: false,
        name: "AmbientBot",
        loggedInID: null,
        scriptLink: "https://rawgit.com/Paradox68/AmbientBot/master/AmbientBot.js",
        cmdLink: "http://git.io/245Ppg",
        chatLink: "https://rawgit.com/Paradox68/AmbientBot/master/lang/en.json",
        chat: null,
        loadChat: loadChat,
        retrieveSettings: retrieveSettings,
        retrieveFromStorage: retrieveFromStorage,
        settings: {
            botName: "AmbientBot",
            monies: [" ", " "],
            language: "english",
            chatLink: "https://rawgit.com/Paradox68/AmbientBot/master/lang/en.json",
            startupCap: 1, // 1-200
            spotLock: "none",
            approvedDJ: "[None]",
            startupVolume: 0, // 0-100
            startupEmoji: true, // true or false
            cmdDeletion: true,
            maximumAfk: 120,
            afkRemoval: true,
            maximumDc: 60,
            bouncerPlus: true,
            blacklistEnabled: true,
            lockdownEnabled: false,
            lockGuard: false,
            maximumLocktime: 10,
            cycleGuard: true,
            maximumCycletime: 10,
            voteSkip: false,
            voteSkipLimit: 10,
            historySkip: false,
            timeGuard: true,
            maximumSongLength: 10,
            autodisable: true,
            commandCooldown: 1,
            usercommandsEnabled: true,
            lockskipPosition: 1,
            lockskipReasons: [
                ["theme", "This song does not fit the room theme. "],
                ["op", "This song is on the OP list. "],
                ["history", "This song is in the history. "],
                ["mix", "You played a mix, which is against the rules. "],
                ["sound", "The song you played had bad sound quality or no sound. "],
                ["nsfw", "The song you contained was NSFW (image or sound). "],
                ["unavailable", "The song you played was not available for some users. "]
            ],
            afkpositionCheck: 5,
            afkRankCheck: "ambassador",
            motdEnabled: false,
            motdInterval: 30,
            motd: "The Ambient Chill Room focuses on bringing you the best new music around. With a fun community and anti-pop culture music, it is easy to find your place here.",
            filterChat: true,
            etaRestriction: false,
            welcome: true,
            opLink: null,
            rulesLink: null,
            themeLink: null,
            fbLink: null,
            youtubeLink: null,
            website: "http://www.the-ambient.info/",
            intervalMessages: [],
            messageInterval: 5,
            songstats: false,
            commandLiteral: "!",
            blacklists: {
                NSFW: "https://rawgit.com/Paradox68/AmbientBot/master/nsfw.json",
                OP: "https://rawgit.com/Paradox68/AmbientBot/master/op.json"
            }
        },
        room: {
            users: [],
            afkList: [],
            mutedUsers: [],
            bannedUsers: [],
            cmdBL: [" ", " "],
            skippable: true,
            usercommand: true,
            allcommand: true,
            afkInterval: null,
            numbergameInterval: null,
            autoraffleInterval: null,
            autoskip: false,
            autoskipTimer: null,
            autodisableInterval: null,
            queueing: 0,
            queueable: true,
            currentDJID: null,
            historyList: [],
            cycleTimer: setTimeout(function () {
            }, 1),
            roomstats: {
                accountName: null,
                totalWoots: 0,
                totalCurates: 0,
                totalMehs: 0,
                launchTime: null,
                songCount: 0,
                chatmessages: 0
            },
            messages: {
                from: [],
                to: [],
                message: []
            },
            queue: {
                id: [],
                position: []
            },
            blacklists: {

            },
            spree: {
                killingspree: 0,
                tmrreset: null,
                    checkSpree: function() {
                        var ks = ambient.room.killingspree;//fucking code wont update
                        if (ks === 5) {
                            API.sendChat('/me KILLING SPREE')
                        }
                        if (ks === 10) {
                            API.sendChat('/me KILLING FRENZY')
                        }
                        if (ks === 15) {
                            API.sendChat('/me RUNNING RIOT')
                        }
                        if (ks === 20) {
                            API.sendChat('/me RAMPAGE')
                        }
                        if (ks === 25) {
                            API.sendChat('/me UNTOUCHABLE')
                        }
                        if (ks === 30) {
                            API.sendChat('/me INVINCIBLE')
                        }
                        if (ks === 35) {
                            API.sendChat('/me INCONVEIVABLE')
                        }
                        if (ks === 40) {
                            API.sendChat('/me UNFRIGGINBELIEVABLE')
                        }
                    ambient.room.spree.tmrreset = setTimeout(function () {
                        if (ambient.room.killingspree > 0) {
                    ambient.room.killingspree--;
                        }
                    }, 3600000);
                    }
            },
            response: {
                getResponse: function() {
                    var toS = " ";
                    var countdown = null;
                    if (arguments[0].indexOf('are you self aware') !== -1) {
                        toS = 'I don\'t know, @' + arguments[1] + ', are you?';
                    }
                    if (arguments[0].indexOf('fuck you') !== -1) {
                        toS = 'No, fuck you, @' + arguments[1] + '.';
                    }
                    if ((arguments[0].indexOf('hello') !== -1) || (arguments[0].indexOf('hey') !== -1) || (arguments[0].indexOf('hi') !== -1) || (arguments[0].indexOf('what\'s up') !== -1) || (arguments[0].indexOf('whats up') !== -1)) {
                        toS = 'Hello, @' + arguments[1] + '. I wish I could have a conversation with you, but I am just a robot.';
                    }
                    if (arguments[0].indexOf('how are you') !== -1) {
                        toS = 'I am neutral, @' + arguments[1] + '. Robots do not suffer the hinderances of human emotion, thus I feel neither well nor unwell..';
                    }
                    if (arguments[0].indexOf('love me') !== -1) {
                        toS = 'If a bot were capable of love, I would love you the most of all the pathetic flesh bags, @' + arguments[1] + '.';
                    }
                    if (arguments[0].indexOf('sex with') !== -1) {
                        toS = 'As a bot I do not follow your humanly laws of attraction.  So despite you being an ugly neckbearded faggot, yes I would. If I were programmed to, @' + arguments[1] + '.';
                    }
                    if (arguments[0].indexOf('what is love') !== -1) {
                        toS = 'Baby don\'t hurt me.';
                    }
                    if (arguments[0].indexOf('don\'t hurt me') !== -1 || arguments[0].indexOf('dont hurt me') !== -1) {
                        toS = 'No more!';
                    }
                    if (arguments[0].indexOf('never gonna give you up') !== -1) {
                        toS = 'Never gonna let you down.';
                    }
                    if (arguments[0].indexOf('never gonna run around') !== -1) {
                        toS = 'And desert you.';
                    }
                    if (arguments[0].indexOf('never gonna make you cry') !== -1) {
                        toS = 'Never gonna say goodbye.';
                    }
                    if (arguments[0].indexOf('never gonna tell a lie') !== -1) {
                        toS = 'And hurt you.';
                    }
                    countdown = setTimeout(function () {
                    if (toS.length > 2) {
                        API.sendChat(toS);
                    }
                    }, 2000);
                }
            },
            cash: {
                usid: null,
                amttoadd: 0,
                updateUserCurrency: function(theuid,theamt) {
                    if($.isNumeric(ambient.settings.monies[theuid]))
                        ambient.settings.monies[theuid] += theamt;
                    else
                        ambient.settings.monies[theuid] = theamt;
                    console.log(ambient.settings.monies);
                }
            },

            /*russiangame: {
             RRStatus: false,
             started: false,
             participants: [],
             countdown: null,
             players: 0,
             chamber: 0,
             gun: 0,
             guncd: null,
             startRussianGame: function () {
             ambient.room.russiangame.RRStatus = true;
             ambient.room.russiangame.chamber = Math.floor(Math.random() * 6 + 1);
             ambient.room.russiangame.players = 0;
             ambient.room.russiangame.gun = 0;
             ambient.room.russiangame.countdown = setTimeout(function () {
             ambient.room.russiangame.endRussianGame();
             }, 300 * 1000);
             ambient.room.russiangame.guncd = setInterval(function () {
             ambient.room.russiangame.shoot();
             }, 5 * 1000);
             API.sendChat('/me Russian Roulette is now active. Type !sit to claim your seat!');
             },
             endRussianGame: function () {
             if (ambient.room.russiangame.RRStatus) {
             ambient.room.russiangame.participants = [];
             ambient.room.russiangame.RRStatus = false;
             ambient.room.russiangame.players = 0;
             ambient.room.russiangame.chamber = 0;
             API.sendChat('/me Russian Roulette seating was not filled and the game has timed out.');
             }
             },
             shoot: function () {
             if (ambient.room.russiangame.RRStatus && ambient.room.russiangame.players >= 6) {
             var ind = ambient.room.roulette.participants[ambient.room.russiangame.gun]);
             var next = ambient.room.russiangame.participants[ind];
             ambient.room.russiangame.started = true;
             ambient.room.russiangame.gun++;
             API.sendChat('/me Testing russian roulette.. shot = ' + ambient.room.russiangame.gun + ', chamber = ' + ambient.room.russiangame.chamber + '.');
             if (ind == ambient.room.chamber) {
             API.sendChat('ded call');
             clearInterval(ambient.room.russiangame.guncd);
             }

             }
             }
             },
             */
            numberG: {
                currentNumber: 0,
                difficulty: 1,
                active: false,
                countdown: null,
                max: 50,
                playNumberGame: function() {
                    ambient.room.numberG.active = true;
                    ambient.room.numberG.countdown = setTimeout(function () {
                        ambient.room.numberG.endNumberGameTime();
                    }, 90 * 1000);
                    if (ambient.room.numberG.difficulty == 1) {
                        ambient.room.numberG.currentNumber = Math.floor((Math.random() * 9) + 1);
                        ambient.room.numberG.max = 10;
                    }
                    if (ambient.room.numberG.difficulty == 2) {
                        ambient.room.numberG.currentNumber = Math.floor((Math.random() * 24) + 1);
                        ambient.room.numberG.max = 25;
                    }
                    if (ambient.room.numberG.difficulty == 3) {
                        ambient.room.numberG.currentNumber = Math.floor((Math.random() * 49) + 1);
                        ambient.room.numberG.max = 50;
                    }
                    API.sendChat('/me I am thinking of a number between 1 and ' + ambient.room.numberG.max + '. @everyone Type !guess # to guess what it is!');
                },
                endNumberGameTime: function() {
                    if (ambient.room.numberG.active) {
                        ambient.room.numberG.active = false;
                        ambient.room.numberG.max = 0;
                        API.sendChat('/me Nobody has guessed the number I was thinking of correctly. :sleeping: Game over. The number was ' + ambient.room.numberG.currentNumber + '.');
                        ambient.room.numberG.currentNumber = 0;
                    }
                },
                endNumberGame: function(winnerID) {

                    var name = "undefined";
                    for (var i = 0; i < ambient.room.users.length; i++) {
                        if (ambient.room.users[i].id === winnerID) {
                            name = ambient.room.users[i].username;

                            ambient.room.numberG.active = false;
                            ambient.room.numberG.max = 0;
                            API.sendChat('/me ' + name + ' has won the Number Game. The number was ' + ambient.room.numberG.currentNumber + '.');
                            ambient.room.numberG.currentNumber = 0;
                            setTimeout(function () {
                                if (API.getWaitListPosition(winnerID) > 3) {
                                    ambient.userUtilities.moveUser(winnerID, 3, false);
                                } else {
                                    ambient.userUtilities.moveUser(winnerID, 1, false);
                                }
                            }, 1 * 1000);
                        }
                    }
                }
            },

            dicegame: {
                highestRoll: 0,
                highestRollerID: "undefined",
                winning: "nobody",
                dgStatus: false,
                participants: [],
                countdown: null,
                startDiceGame: function () {
                    ambient.room.dicegame.dgStatus = true;
                    ambient.room.dicegame.countdown = setTimeout(function () {
                        ambient.room.dicegame.endDiceGame();
                    }, 60 * 1000);
                    API.sendChat('/me The Dice Game is now active. @everyone Type !roll and whoever rolls the highest will win! Use !buyroll to purchase an extra roll for 50 ChillCoins.');
                },
                endDiceGame: function () {
                    ambient.room.dicegame.dgStatus = false;
                    var winner = "undefined";
                    var ind = 0;
                    for (var i = 0; i < ambient.room.users.length; i++) {
                        if (ambient.room.users[i].id === ambient.room.dicegame.highestRollerID) {
                            ind = i;

                            ambient.room.dicegame.participants = [];
                            var pos = 1;
                            if (ambient.settings.spotLock !== "none") {
                                pos = 2;
                            }
                            //var pos = Math.floor((Math.random() * API.getWaitList().length) + 1);
                            var name = ambient.room.users[ind].username;
                            ambient.settings.spotLock = "none";
                            API.sendChat('/me ' + name + ' has won the Dice Game with a ' + ambient.room.dicegame.highestRoll + '. Moving to spot ' + pos + '.');
                            ambient.room.dicegame.highestRoll = 0;
                            ambient.room.dicegame.highestRollerID = "undefined";
                            setTimeout(function (winner, pos) {
                                ambient.userUtilities.moveUser(ambient.room.users[ind].id, pos, false);
                            }, 1 * 1000, ambient.room.users[ind].id, pos);
                        }
                    }
                }

            },
            newBlacklisted: [],
            newBlacklistedSongFunction: null,
            roulette: {
                rouletteStatus: false,
                participants: [],
                countdown: null,
                startRoulette: function () {
                    ambient.room.roulette.rouletteStatus = true;
                    ambient.room.roulette.countdown = setTimeout(function () {
                        ambient.room.roulette.endRoulette();
                    }, 60 * 1000);
                    API.sendChat('/me The Raffle is now open. @everyone Type !join to try your luck!');
                },
                endRoulette: function () {
                    ambient.room.roulette.rouletteStatus = false;
                    var ind = Math.floor(Math.random() * ambient.room.roulette.participants.length);
                    var winner = ambient.room.roulette.participants[ind];
                    ambient.room.roulette.participants = [];
                    var pos = 1;
                    if (ambient.settings.spotLock !== "none") {
                        pos = 2;
                    }
                    //var pos = Math.floor((Math.random() * API.getWaitList().length) + 1);
                    var user = ambient.userUtilities.lookupUser(winner);
                    var name = user.username;
                    ambient.settings.spotLock = "none";
                    API.sendChat(subChat(ambient.chat.winnerpicked, {name: name, position: pos}));
                    setTimeout(function (winner, pos) {
                        ambient.userUtilities.moveUser(winner, pos, false);
                    }, 1 * 1000, winner, pos);
                }
            }
        },
        User: function (id, name) {
            this.id = id;
            this.username = name;
            this.jointime = Date.now();
            this.lastActivity = Date.now();
            this.votes = {
                woot: 0,
                meh: 0,
                curate: 0
            };
            this.lastEta = null;
            this.afkWarningCount = 0;
            this.afkCountdown = null;
            this.inRoom = true;
            this.isMuted = false;
            this.lastDC = {
                time: null,
                position: null,
                songCount: 0
            };
            this.lastKnownPosition = null;
        },
        userUtilities: {
            getJointime: function (user) {
                return user.jointime;
            },
            getUser: function (user) {
                return API.getUser(user.id);
            },
            updatePosition: function (user, newPos) {
                user.lastKnownPosition = newPos;
            },
            updateDC: function (user) {
                user.lastDC.time = Date.now();
                user.lastDC.position = user.lastKnownPosition;
                user.lastDC.songCount = ambient.room.roomstats.songCount;
            },
            setLastActivity: function (user) {
                user.lastActivity = Date.now();
                user.afkWarningCount = 0;
                clearTimeout(user.afkCountdown);
            },
            getLastActivity: function (user) {
                return user.lastActivity;
            },
            getWarningCount: function (user) {
                return user.afkWarningCount;
            },
            setWarningCount: function (user, value) {
                user.afkWarningCount = value;
            },
            lookupUser: function (id) {
                for (var i = 0; i < ambient.room.users.length; i++) {
                    if (ambient.room.users[i].id === id) {
                        return ambient.room.users[i];
                    }
                }
                return false;
            },
            lookupUserName: function (name) {
                for (var i = 0; i < ambient.room.users.length; i++) {
                    var match = ambient.room.users[i].username.trim() == name.trim();
                    if (match) {
                        return ambient.room.users[i];
                    }
                }
                return false;
            },
            voteRatio: function (id) {
                var user = ambient.userUtilities.lookupUser(id);
                var votes = user.votes;
                if (votes.meh === 0) votes.ratio = 1;
                else votes.ratio = (votes.woot / votes.meh).toFixed(2);
                return votes;

            },
            getPermission: function (obj) { //1 requests
                var u;
                if (typeof obj === "object") u = obj;
                else u = API.getUser(obj);
                for (var i = 0; i < botCreatorIDs.length; i++) {
                    if (botCreatorIDs[i].indexOf(u.id) > -1) return 10;
                }
                if (u.gRole < 2) return u.role;
                else {
                    switch (u.gRole) {
                        case 2:
                            return 7;
                        case 3:
                            return 8;
                        case 4:
                            return 9;
                        case 5:
                            return 10;
                    }
                }
                return 0;
            },
            moveUser: function (id, pos, priority) {
                var user = ambient.userUtilities.lookupUser(id);
                var wlist = API.getWaitList();
                if (API.getWaitListPosition(id) === -1) {
                    if (wlist.length < 50) {
                        API.moderateAddDJ(id);
                        if (pos !== 0) setTimeout(function (id, pos) {
                            API.moderateMoveDJ(id, pos);
                        }, 1250, id, pos);
                    }
                    else {
                        var alreadyQueued = -1;
                        for (var i = 0; i < ambient.room.queue.id.length; i++) {
                            if (ambient.room.queue.id[i] === id) alreadyQueued = i;
                        }
                        if (alreadyQueued !== -1) {
                            ambient.room.queue.position[alreadyQueued] = pos;
                            return API.sendChat(subChat(ambient.chat.alreadyadding, {position: ambient.room.queue.position[alreadyQueued]}));
                        }
                        ambient.roomUtilities.booth.lockBooth();
                        if (priority) {
                            ambient.room.queue.id.unshift(id);
                            ambient.room.queue.position.unshift(pos);
                        }
                        else {
                            ambient.room.queue.id.push(id);
                            ambient.room.queue.position.push(pos);
                        }
                        var name = user.username;
                        return API.sendChat(subChat(ambient.chat.adding, {name: name, position: ambient.room.queue.position.length}));
                    }
                }
                else API.moderateMoveDJ(id, pos);
            },
            dclookup: function (id) {
                var user = ambient.userUtilities.lookupUser(id);
                if (typeof user === 'boolean') return ambient.chat.usernotfound;
                var name = user.username;
                if (user.lastDC.time === null) return subChat(ambient.chat.notdisconnected, {name: name});
                var dc = user.lastDC.time;
                var pos = user.lastDC.position;
                if (pos === null) return ambient.chat.noposition;
                var timeDc = Date.now() - dc;
                var validDC = false;
                if (ambient.settings.maximumDc * 60 * 1000 > timeDc) {
                    validDC = true;
                }
                var time = ambient.roomUtilities.msToStr(timeDc);
                if (!validDC) return (subChat(ambient.chat.toolongago, {name: ambient.userUtilities.getUser(user).username, time: time}));
                var songsPassed = ambient.room.roomstats.songCount - user.lastDC.songCount;
                var afksRemoved = 0;
                var afkList = ambient.room.afkList;
                for (var i = 0; i < afkList.length; i++) {
                    var timeAfk = afkList[i][1];
                    var posAfk = afkList[i][2];
                    if (dc < timeAfk && posAfk < pos) {
                        afksRemoved++;
                    }
                }
                var newPosition = user.lastDC.position - songsPassed - afksRemoved;
                if (newPosition <= 0) newPosition = 1;
                var msg = subChat(ambient.chat.valid, {name: ambient.userUtilities.getUser(user).username, time: time, position: newPosition});
                ambient.userUtilities.moveUser(user.id, newPosition, true);
                return msg;
            },
                    joindclookup: function (id) {
                var user = ambient.userUtilities.lookupUser(id);
                var msg = " ";
                if (typeof user === 'boolean') msg = " ";
                var name = user.username;
                if (user.lastDC.time === null) msg = " ";
                var dc = user.lastDC.time;
                var pos = user.lastDC.position;
                if (pos === null) msg = " ";
                var timeDc = Date.now() - dc;
                var validDC = false;
                if (600 * 1000 > timeDc) {
                    validDC = true;
                }
                var time = ambient.roomUtilities.msToStr(timeDc);
                if (!validDC) msg = " ";
                var songsPassed = ambient.room.roomstats.songCount - user.lastDC.songCount;
                var afksRemoved = 0;
                var afkList = ambient.room.afkList;
                for (var i = 0; i < afkList.length; i++) {
                    var timeAfk = afkList[i][1];
                    var posAfk = afkList[i][2];
                    if (dc < timeAfk && posAfk < pos) {
                        afksRemoved++;
                    }
                }
                if (msg.length > 2) {
                var newPosition = user.lastDC.position - songsPassed - afksRemoved;
                if (newPosition <= 0) newPosition = 1;
                msg = "Oh, it looks like you disconnected while you were in the DJ queue, @" + name + ". I\'ll move you back to where you were!";
                ambient.userUtilities.moveUser(user.id, newPosition, true);

                API.sendChat(msg);
                }
            }
        },

        roomUtilities: {
            rankToNumber: function (rankString) {
                var rankInt = null;
                switch (rankString) {
                    case "admin":
                        rankInt = 10;
                        break;
                    case "ambassador":
                        rankInt = 7;
                        break;
                    case "host":
                        rankInt = 5;
                        break;
                    case "cohost":
                        rankInt = 4;
                        break;
                    case "manager":
                        rankInt = 3;
                        break;
                    case "bouncer":
                        rankInt = 2;
                        break;
                    case "residentdj":
                        rankInt = 1;
                        break;
                    case "user":
                        rankInt = 0;
                        break;
                }
                return rankInt;
            },
            msToStr: function (msTime) {
                var ms, msg, timeAway;
                msg = '';
                timeAway = {
                    'days': 0,
                    'hours': 0,
                    'minutes': 0,
                    'seconds': 0
                };
                ms = {
                    'day': 24 * 60 * 60 * 1000,
                    'hour': 60 * 60 * 1000,
                    'minute': 60 * 1000,
                    'second': 1000
                };
                if (msTime > ms.day) {
                    timeAway.days = Math.floor(msTime / ms.day);
                    msTime = msTime % ms.day;
                }
                if (msTime > ms.hour) {
                    timeAway.hours = Math.floor(msTime / ms.hour);
                    msTime = msTime % ms.hour;
                }
                if (msTime > ms.minute) {
                    timeAway.minutes = Math.floor(msTime / ms.minute);
                    msTime = msTime % ms.minute;
                }
                if (msTime > ms.second) {
                    timeAway.seconds = Math.floor(msTime / ms.second);
                }
                if (timeAway.days !== 0) {
                    msg += timeAway.days.toString() + 'd';
                }
                if (timeAway.hours !== 0) {
                    msg += timeAway.hours.toString() + 'h';
                }
                if (timeAway.minutes !== 0) {
                    msg += timeAway.minutes.toString() + 'm';
                }
                if (timeAway.minutes < 1 && timeAway.hours < 1 && timeAway.days < 1) {
                    msg += timeAway.seconds.toString() + 's';
                }
                if (msg !== '') {
                    return msg;
                } else {
                    return false;
                }
            },
            booth: {
                lockTimer: setTimeout(function () {
                }, 1000),
                locked: false,
                lockBooth: function () {
                    API.moderateLockWaitList(!ambient.roomUtilities.booth.locked);
                    ambient.roomUtilities.booth.locked = false;
                    if (ambient.settings.lockGuard) {
                        ambient.roomUtilities.booth.lockTimer = setTimeout(function () {
                            API.moderateLockWaitList(ambient.roomUtilities.booth.locked);
                        }, ambient.settings.maximumLocktime * 60 * 1000);
                    }
                },
                unlockBooth: function () {
                    API.moderateLockWaitList(ambient.roomUtilities.booth.locked);
                    clearTimeout(ambient.roomUtilities.booth.lockTimer);
                }
            },
            afkCheck: function () {
                if (!ambient.status || !ambient.settings.afkRemoval) return void (0);
                var rank = ambient.roomUtilities.rankToNumber(ambient.settings.afkRankCheck);
                var djlist = API.getWaitList();
                var lastPos = Math.min(djlist.length, ambient.settings.afkpositionCheck);
                if (lastPos - 1 > djlist.length) return void (0);
                for (var i = 0; i < lastPos; i++) {
                    if (typeof djlist[i] !== 'undefined') {
                        var id = djlist[i].id;
                        var user = ambient.userUtilities.lookupUser(id);
                        if (typeof user !== 'boolean') {
                            var plugUser = ambient.userUtilities.getUser(user);
                            if (rank !== null && ambient.userUtilities.getPermission(plugUser) <= rank) {
                                var name = plugUser.username;
                                var lastActive = ambient.userUtilities.getLastActivity(user);
                                var inactivity = Date.now() - lastActive;
                                var time = ambient.roomUtilities.msToStr(inactivity);
                                var warncount = user.afkWarningCount;
                                if (inactivity > ambient.settings.maximumAfk * 60 * 1000) {
                                    if (warncount === 0) {
                                        API.sendChat(subChat(ambient.chat.warning1, {name: name, time: time}));
                                        user.afkWarningCount = 3;
                                        user.afkCountdown = setTimeout(function (userToChange) {
                                            userToChange.afkWarningCount = 1;
                                        }, 240 * 1000, user);
                                    }
                                    else if (warncount === 1) {
                                        API.sendChat(subChat(ambient.chat.warning2, {name: name}));
                                        user.afkWarningCount = 3;
                                        user.afkCountdown = setTimeout(function (userToChange) {
                                            userToChange.afkWarningCount = 2;
                                        }, 60 * 1000, user);
                                    }
                                    else if (warncount === 2) {
                                        var pos = API.getWaitListPosition(id);
                                        if (pos !== -1) {
                                            pos++;
                                            ambient.room.afkList.push([id, Date.now(), pos]);
                                            user.lastDC = {

                                                time: null,
                                                position: null,
                                                songCount: 0
                                            };
                                            API.moderateRemoveDJ(id);
                                            ambient.room.spree.killingSpree++;
                                            ambient.room.spree.checkSpree();
                                            API.sendChat(subChat(ambient.chat.afkremove, {name: name, time: time, position: pos, maximumafk: ambient.settings.maximumAfk}));
                                        }
                                        user.afkWarningCount = 0;
                                    }
                                }
                            }
                        }
                    }
                }
            },
            changeDJCycle: function () {
                var toggle = $(".cycle-toggle");
                if (toggle.hasClass("disabled")) {
                    toggle.click();
                    if (ambient.settings.cycleGuard) {
                        ambient.room.cycleTimer = setTimeout(function () {
                            if (toggle.hasClass("enabled")) toggle.click();
                        }, ambient.settings.cycleMaxTime * 60 * 1000);
                    }
                }
                else {
                    toggle.click();
                    clearTimeout(ambient.room.cycleTimer);
                }
            },
            intervalMessage: function () {
                var interval;
                if (ambient.settings.motdEnabled) interval = ambient.settings.motdInterval;
                else interval = ambient.settings.messageInterval;
                if ((ambient.room.roomstats.songCount % interval) === 0 && ambient.status) {
                    var msg;
                    if (ambient.settings.motdEnabled) {
                        msg = ambient.settings.motd;
                    }
                    else {
                        if (ambient.settings.intervalMessages.length === 0) return void (0);
                        var messageNumber = ambient.room.roomstats.songCount % ambient.settings.intervalMessages.length;
                        msg = ambient.settings.intervalMessages[messageNumber];
                    }
                    API.sendChat('/me ' + msg);
                }
            },
            updateBlacklists: function () {
                for (var bl in ambient.settings.blacklists) {
                    ambient.room.blacklists[bl] = [];
                    if (typeof ambient.settings.blacklists[bl] === 'function') {
                        ambient.room.blacklists[bl] = ambient.settings.blacklists();
                    }
                    else if (typeof ambient.settings.blacklists[bl] === 'string') {
                        if (ambient.settings.blacklists[bl] === '') {
                            continue;
                        }
                        try {
                            (function (l) {
                                $.get(ambient.settings.blacklists[l], function (data) {
                                    if (typeof data === 'string') {
                                        data = JSON.parse(data);
                                    }
                                    var list = [];
                                    for (var prop in data) {
                                        if (typeof data[prop].mid !== 'undefined') {
                                            list.push(data[prop].mid);
                                        }
                                    }
                                    ambient.room.blacklists[l] = list;
                                })
                            })(bl);
                        }
                        catch (e) {
                            API.chatLog('Error setting' + bl + 'blacklist.');
                            console.log('Error setting' + bl + 'blacklist.');
                            console.log(e);
                        }
                    }
                }
            },
            logNewBlacklistedSongs: function () {
                if (typeof console.table !== 'undefined') {
                    console.table(ambient.room.newBlacklisted);
                }
                else {
                    console.log(ambient.room.newBlacklisted);
                }
            },
            exportNewBlacklistedSongs: function () {
                var list = {};
                for (var i = 0; i < ambient.room.newBlacklisted.length; i++) {
                    var track = ambient.room.newBlacklisted[i];
                    list[track.list] = [];
                    list[track.list].push({
                        title: track.title,
                        author: track.author,
                        mid: track.mid
                    });
                }
                return list;
            }
        },
        eventChat: function (chat) {
            chat.message = linkFixer(chat.message);
            chat.message = chat.message.trim();
            for (var i = 0; i < ambient.room.users.length; i++) {
                if (ambient.room.users[i].id === chat.uid) {
                    ambient.userUtilities.setLastActivity(ambient.room.users[i]);
                    if (ambient.room.users[i].username !== chat.un) {
                        ambient.room.users[i].username = chat.un;
                    }
                }
            }
            if (chat.message.indexOf(ambient.settings.botName) !== -1) {
                if (chat.un.indexOf(ambient.settings.botName) === -1) {
                ambient.room.response.getResponse(chat.message.toLowerCase(), chat.un);
                }
            }
            if (ambient.chatUtilities.chatFilter(chat)) { return void (0); }
            for (var i = 0; i < ambient.room.length; i++) {
                if (ambient.room.cmdBL[i] === chat.uid) {
                    return void (0);
                }
            }

            if (!ambient.chatUtilities.commandCheck(chat))
                ambient.chatUtilities.action(chat);
        },
        eventUserjoin: function (user) {
            var known = false;
            var index = null;
            for (var i = 0; i < ambient.room.users.length; i++) {
                if (ambient.room.users[i].id === user.id) {
                    known = true;
                    index = i;
                }
            }
            var greet = true;
            var welcomeback = null;
            if (known) {
                ambient.room.users[index].inRoom = true;
                var u = ambient.userUtilities.lookupUser(user.id);
                var jt = u.jointime;
                var t = Date.now() - jt;
                if (t < 10 * 1000) greet = false;
                else welcomeback = true;
            }
            else {
                ambient.room.users.push(new ambient.User(user.id, user.username));
                welcomeback = false;
            }
            for (var j = 0; j < ambient.room.users.length; j++) {
                if (ambient.userUtilities.getUser(ambient.room.users[j]).id === user.id) {
                    ambient.userUtilities.setLastActivity(ambient.room.users[j]);
                    ambient.room.users[j].jointime = Date.now();
                }

            }
            if (ambient.settings.welcome && greet) {
                welcomeback ?
                    setTimeout(function (user) {
                        API.sendChat(subChat('/me Welcome back to The Ambient Chill Room, @' + user.username + '.'));
                    }, 1 * 1000, user)
                    :
                    setTimeout(function (user) {
                        API.sendChat(subChat('/me Welcome to The Ambient Chill Room, @' + user.username + '. Enjoy your stay.'));
                    }, 1 * 1000, user);

            }
                ambient.userUtilities.joindclookup(user.id);
        },
        eventUserleave: function (user) {
            for (var i = 0; i < ambient.room.users.length; i++) {
                if (ambient.room.users[i].id === user.id) {
                    ambient.userUtilities.updateDC(ambient.room.users[i]);
                    ambient.room.users[i].inRoom = false;
                }
            }
        },
        eventVoteupdate: function (obj) {
            for (var i = 0; i < ambient.room.users.length; i++) {
                if (ambient.room.users[i].id === obj.user.id) {
                    if (obj.vote === 1) {
                        ambient.room.users[i].votes.woot++;
                        ambient.room.cash.updateUserCurrency(API.getDJ().id, 1);
                        //add currency, set the user first
                    }
                    else {
                        ambient.room.users[i].votes.meh++;
                    }
                }
            }

            var mehs = API.getScore().negative;
            var woots = API.getScore().positive;
            var dj = API.getDJ();

            if (ambient.settings.voteSkip) {
                if ((mehs - woots) >= (ambient.settings.voteSkipLimit)) {
                    API.sendChat(subChat(ambient.chat.voteskipexceededlimit, {name: dj.username, limit: ambient.settings.voteSkipLimit}));
                    API.moderateForceSkip();
                }
            }

        },
        eventCurateupdate: function (obj) {
            for (var i = 0; i < ambient.room.users.length; i++) {
                if (ambient.room.users[i].id === obj.user.id) {
                    ambient.room.users[i].votes.curate++;
                }
            }
        },
        eventDjadvance: function (obj) {
            $("#woot").click(); // autowoot

            var user = ambient.userUtilities.lookupUser(obj.dj.id)
            for(var i = 0; i < ambient.room.users.length; i++){
                if(ambient.room.users[i].id === user.id){
                    ambient.room.users[i].lastDC = {
                        time: null,
                        position: null,
                        songCount: 0
                    };
                }
            }

            var lastplay = obj.lastPlay;
            if (typeof lastplay === 'undefined') return;
            if (ambient.settings.songstats) {
                if (typeof ambient.chat.songstatistics === "undefined") {
                    API.sendChat("/me :arrow_forward: Last Track: \n" + lastplay.media.author + " - " + lastplay.media.title + ": \n:arrow_up: " + lastplay.score.positive + ", :repeat: " + lastplay.score.grabs + ", :arrow_down: " + lastplay.score.negative + ".");
                }
                else {
                    API.sendChat(subChat("/me :arrow_forward: Last Track: \n" + lastplay.media.author + " - " + lastplay.media.title + ": \n:arrow_up: " + lastplay.score.positive + ", :repeat: " + lastplay.score.grabs + ", :arrow_down: " + lastplay.score.negative + "."));
                }
            }
            ambient.room.roomstats.totalWoots += lastplay.score.positive;
            ambient.room.roomstats.totalMehs += lastplay.score.negative;
            ambient.room.roomstats.totalCurates += lastplay.score.grabs;
            ambient.room.roomstats.songCount++;
            ambient.roomUtilities.intervalMessage();
            ambient.room.currentDJID = obj.dj.id;
            ambient.settings.spotLock = "none";
            if (ambient.room.currentDJID === ambient.settings.approvedDJ) {
                API.sendChat(subChat('/me :arrow_forward: This Track has been approved.'));
                ambient.settings.approvedDJ = "[none]";
            }

            var mid = obj.media.format + ':' + obj.media.cid;
            for (var bl in ambient.room.blacklists) {
                if (ambient.settings.blacklistEnabled) {
                    if (ambient.room.blacklists[bl].indexOf(mid) > -1) {
                        API.sendChat(subChat(ambient.chat.isblacklisted, {blacklist: bl}));
                        return API.moderateForceSkip();
                    }
                }
            }
            clearTimeout(historySkip);
            if (ambient.settings.historySkip) {
                var alreadyPlayed = false;
                var apihistory = API.getHistory();
                var name = obj.dj.username;
                var historySkip = setTimeout(function () {
                    for (var i = 0; i < apihistory.length; i++) {
                        if (apihistory[i].media.cid === obj.media.cid) {
                            API.sendChat(subChat(ambient.chat.songknown, {name: name}));
                            API.moderateForceSkip();
                            ambient.room.historyList[i].push(+new Date());
                            alreadyPlayed = true;
                        }
                    }
                    if (!alreadyPlayed) {
                        ambient.room.historyList.push([obj.media.cid, +new Date()]);
                    }
                }, 2000);
            }
            var newMedia = obj.media;
            if (ambient.settings.timeGuard && newMedia.duration > ambient.settings.maximumSongLength * 60 && !ambient.room.roomevent && obj.dj.id !== ambient.settings.approvedDJ) {
                var name = obj.dj.username;
                var id = obj.dj.id;
                API.sendChat('Your song is too long, ' + name + '.');
            }
            if (user.ownSong) {
                API.sendChat(subChat(ambient.chat.permissionownsong, {name: user.username}));
                user.ownSong = false;
            }
            clearTimeout(ambient.room.autoskipTimer);
            if (ambient.room.autoskip) {
                var remaining = obj.media.duration * 1000;
                ambient.room.autoskipTimer = setTimeout(function () {
                    console.log("Skipping track.");
                    //API.sendChat('Song stuck, skipping...');
                    API.moderateForceSkip();
                }, remaining + 3000);
            }
            storeToStorage();

        },
        eventWaitlistupdate: function (users) {
            if (users.length < 50) {
                if (ambient.room.queue.id.length > 0 && ambient.room.queueable) {
                    ambient.room.queueable = false;
                    setTimeout(function () {
                        ambient.room.queueable = true;
                    }, 500);
                    ambient.room.queueing++;
                    var id, pos;
                    setTimeout(
                        function () {
                            id = ambient.room.queue.id.splice(0, 1)[0];
                            pos = ambient.room.queue.position.splice(0, 1)[0];
                            API.moderateAddDJ(id, pos);
                            setTimeout(
                                function (id, pos) {
                                    API.moderateMoveDJ(id, pos);
                                    ambient.room.queueing--;
                                    if (ambient.room.queue.id.length === 0) setTimeout(function () {
                                        ambient.roomUtilities.booth.unlockBooth();
                                    }, 1000);
                                }, 1000, id, pos);
                        }, 1000 + ambient.room.queueing * 2500);
                }
            }
            for (var i = 0; i < users.length; i++) {
                var user = ambient.userUtilities.lookupUser(users[i].id);
                ambient.userUtilities.updatePosition(user, API.getWaitListPosition(users[i].id) + 1);
            }
        },
        chatcleaner: function (chat) {
            if (!ambient.settings.filterChat) return false;
            if (ambient.userUtilities.getPermission(chat.uid) > 1) return false;
            var msg = chat.message;
            var containsLetters = false;
            for (var i = 0; i < msg.length; i++) {
                ch = msg.charAt(i);
                if ((ch >= 'a' && ch <= 'z') || (ch >= 'A' && ch <= 'Z') || (ch >= '0' && ch <= '9') || ch === ':' || ch === '^') containsLetters = true;
            }
            if (msg === '') {
                return true;
            }
            if (!containsLetters && (msg.length === 1 || msg.length > 3)) return true;
            msg = msg.replace(/[ ,;.:\/=~+%^*\-\\"'&@#]/g, '');
            var capitals = 0;
            var ch;
            for (var i = 0; i < msg.length; i++) {
                ch = msg.charAt(i);
                if (ch >= 'A' && ch <= 'Z') capitals++;
            }
            if (capitals >= 40) {
                API.sendChat(subChat(ambient.chat.caps, {name: chat.un}));
                return true;
            }
            msg = msg.toLowerCase();
            if (msg === 'skip') {
                API.sendChat(subChat(ambient.chat.askskip, {name: chat.un}));
                return true;
            }
            for (var j = 0; j < ambient.chatUtilities.spam.length; j++) {
                if (msg === ambient.chatUtilities.spam[j]) {
                    API.sendChat(subChat(ambient.chat.spam, {name: chat.un}));
                    return true;
                }
            }
            return false;
        },
        chatUtilities: {
            chatFilter: function (chat) {
                var msg = chat.message;
                var perm = ambient.userUtilities.getPermission(chat.uid);
                var user = ambient.userUtilities.lookupUser(chat.uid);
                var isMuted = false;
                for (var i = 0; i < ambient.room.mutedUsers.length; i++) {
                    if (ambient.room.mutedUsers[i] === chat.uid) isMuted = true;
                }
                if (isMuted) {
                    API.moderateDeleteChat(chat.cid);
                    API.chatLog('deletion 11');
                    return true;
                }
                if (ambient.settings.lockdownEnabled) {
                    if (perm === 0) {
                        API.moderateDeleteChat(chat.cid);
                        API.chatLog('deletion 1');
                        return true;
                    }
                }
                if (ambient.chatcleaner(chat)) {
                    API.moderateDeleteChat(chat.cid);
                    API.chatLog('deletion 2');
                    return true;
                }
                /**
                 var plugRoomLinkPatt = /(\bhttps?:\/\/(www.)?plug\.dj[-A-Z0-9+&@#\/%?=~_|!:,.;]*[-A-Z0-9+&@#\/%=~_|])/ig;
                 if (plugRoomLinkPatt.exec(msg)) {
                    if (perm === 0) {
                        API.sendChat(subChat(ambient.chat.roomadvertising, {name: chat.un}));
                        API.moderateDeleteChat(chat.cid);
                        return true;
                    }
                }
                 **/
                if (msg.indexOf('http://adf.ly/') > -1) {
                    API.moderateDeleteChat(chat.cid);
                    API.chatLog('deletion 3');
                    API.sendChat(subChat(ambient.chat.adfly, {name: chat.un}));
                    return true;
                }
                if (msg.indexOf('autojoin was not enabled') > 0 || msg.indexOf('AFK message was not enabled') > 0 || msg.indexOf('!afkdisable') > 0 || msg.indexOf('!joindisable') > 0 || msg.indexOf('autojoin disabled') > 0 || msg.indexOf('AFK message disabled') > 0) {
                    API.moderateDeleteChat(chat.cid);
                    API.chatLog('deletion 4');
                    return true;
                }

                var rlJoinChat = ambient.chat.roulettejoin;
                var rlLeaveChat = ambient.chat.rouletteleave;

                var joinedroulette = rlJoinChat.split('%%NAME%%');
                if (joinedroulette[1].length > joinedroulette[0].length) joinedroulette = joinedroulette[1];
                else joinedroulette = joinedroulette[0];

                var leftroulette = rlLeaveChat.split('%%NAME%%');
                if (leftroulette[1].length > leftroulette[0].length) leftroulette = leftroulette[1];
                else leftroulette = leftroulette[0];

                if ((msg.indexOf(joinedroulette) > -1 || msg.indexOf(leftroulette) > -1) && chat.uid === ambient.loggedInID) {
                    setTimeout(function (id) {
                        API.moderateDeleteChat(id);
                        API.chatLog('deletion 5');
                    }, 2 * 1000, chat.cid);
                    return true;
                }
                return false;
            },
            commandCheck: function (chat) {
                var bled = false;
             for (var i = 0; i < ambient.room.length; i++) {
                if (ambient.room.cmdBL[i] === chat.uid) {
                    bled = true
                }
            }
                var cmd;
                if (chat.message.charAt(0) === '!') {
                    var space = chat.message.indexOf(' ');
                    if (space === -1) {
                        cmd = chat.message;
                    }
                    else cmd = chat.message.substring(0, space);
                }
                else return false;
                var userPerm = ambient.userUtilities.getPermission(chat.uid);
                //console.log("name: " + chat.un + ", perm: " + userPerm);
                if (chat.message !== "!join" && chat.message !== "!leave") {
                    if (userPerm === 0 && !ambient.room.usercommand) return void (0);
                    if (!ambient.room.allcommand) return void (0);
                }
                if (chat.message === '!eta' && ambient.settings.etaRestriction) {
                    if (userPerm < 2) {
                        var u = ambient.userUtilities.lookupUser(chat.uid);
                        if (u.lastEta !== null && (Date.now() - u.lastEta) < 1 * 60 * 60 * 1000) {
                            API.moderateDeleteChat(chat.cid);
                            API.chatLog('deletion 6');
                            return void (0);
                        }
                        else u.lastEta = Date.now();
                    }
                }
                var executed = false;

                for (var comm in ambient.commands) {
                    var cmdCall = ambient.commands[comm].command;
                    if (!Array.isArray(cmdCall)) {
                        cmdCall = [cmdCall]
                    }
                    for (var i = 0; i < cmdCall.length; i++) {
                        if (ambient.settings.commandLiteral + cmdCall[i] === cmd && !bled) {
                            ambient.commands[comm].functionality(chat, ambient.settings.commandLiteral + cmdCall[i]);
                            executed = true;
                            break;
                        }
                    }
                }

                if (executed && userPerm === 0) {
                    ambient.room.usercommand = false;
                    setTimeout(function () {
                        ambient.room.usercommand = true;
                    }, ambient.settings.commandCooldown * 1000);
                }
                if (executed) {
                    if (ambient.settings.cmdDeletion) {
                        API.moderateDeleteChat(chat.cid);
                        API.chatLog('deletion 7');
                    }
                    ambient.room.allcommand = false;
                    setTimeout(function () {
                        ambient.room.allcommand = true;
                    }, 200);
                }
                return executed;
            },
            action: function (chat) {
                var user = ambient.userUtilities.lookupUser(chat.uid);
                if (chat.type === 'message') {
                    for (var j = 0; j < ambient.room.users.length; j++) {
                        if (ambient.userUtilities.getUser(ambient.room.users[j]).id === chat.uid) {
                            ambient.userUtilities.setLastActivity(ambient.room.users[j]);
                        }

                    }
                }
                ambient.room.roomstats.chatmessages++;
            },
            spam: [
                'hueh', 'hu3', 'brbr', 'heu', 'brbr', 'kkkk', 'spoder', 'mafia', 'zuera', 'zueira',
                'zueria', 'aehoo', 'aheu', 'alguem', 'algum', 'brazil', 'zoeira', 'fuckadmins', 'affff', 'vaisefoder', 'huenaarea',
                'hitler', 'ashua', 'ahsu', 'ashau', 'lulz', 'huehue', 'hue', 'huehuehue', 'merda', 'pqp', 'puta', 'mulher', 'pula', 'retarda', 'caralho', 'filha', 'ppk',
                'gringo', 'fuder', 'foder', 'hua', 'ahue', 'modafuka', 'modafoka', 'mudafuka', 'mudafoka', 'ooooooooooooooo', 'foda'
            ],
            curses: [
                'nigger', 'faggot', 'nigga', 'niqqa', 'motherfucker', 'modafocka'
            ]
        },
        connectAPI: function () {
            this.proxy = {
                eventChat: $.proxy(this.eventChat, this),
                eventUserskip: $.proxy(this.eventUserskip, this),
                eventUserjoin: $.proxy(this.eventUserjoin, this),
                eventUserleave: $.proxy(this.eventUserleave, this),
                //eventFriendjoin: $.proxy(this.eventFriendjoin, this),
                eventVoteupdate: $.proxy(this.eventVoteupdate, this),
                eventCurateupdate: $.proxy(this.eventCurateupdate, this),
                eventRoomscoreupdate: $.proxy(this.eventRoomscoreupdate, this),
                eventDjadvance: $.proxy(this.eventDjadvance, this),
                //eventDjupdate: $.proxy(this.eventDjupdate, this),
                eventWaitlistupdate: $.proxy(this.eventWaitlistupdate, this),
                eventVoteskip: $.proxy(this.eventVoteskip, this),
                eventModskip: $.proxy(this.eventModskip, this),
                eventChatcommand: $.proxy(this.eventChatcommand, this),
                eventHistoryupdate: $.proxy(this.eventHistoryupdate, this),

            };
            API.on(API.CHAT, this.proxy.eventChat);
            API.on(API.USER_SKIP, this.proxy.eventUserskip);
            API.on(API.USER_JOIN, this.proxy.eventUserjoin);
            API.on(API.USER_LEAVE, this.proxy.eventUserleave);
            API.on(API.VOTE_UPDATE, this.proxy.eventVoteupdate);
            API.on(API.GRAB_UPDATE, this.proxy.eventCurateupdate);
            API.on(API.ROOM_SCORE_UPDATE, this.proxy.eventRoomscoreupdate);
            API.on(API.ADVANCE, this.proxy.eventDjadvance);
            API.on(API.WAIT_LIST_UPDATE, this.proxy.eventWaitlistupdate);
            API.on(API.MOD_SKIP, this.proxy.eventModskip);
            API.on(API.CHAT_COMMAND, this.proxy.eventChatcommand);
            API.on(API.HISTORY_UPDATE, this.proxy.eventHistoryupdate);
        },
        disconnectAPI: function () {
            API.off(API.CHAT, this.proxy.eventChat);
            API.off(API.USER_SKIP, this.proxy.eventUserskip);
            API.off(API.USER_JOIN, this.proxy.eventUserjoin);
            API.off(API.USER_LEAVE, this.proxy.eventUserleave);
            API.off(API.VOTE_UPDATE, this.proxy.eventVoteupdate);
            API.off(API.CURATE_UPDATE, this.proxy.eventCurateupdate);
            API.off(API.ROOM_SCORE_UPDATE, this.proxy.eventRoomscoreupdate);
            API.off(API.ADVANCE, this.proxy.eventDjadvance);
            API.off(API.WAIT_LIST_UPDATE, this.proxy.eventWaitlistupdate);
            API.off(API.MOD_SKIP, this.proxy.eventModskip);
            API.off(API.CHAT_COMMAND, this.proxy.eventChatcommand);
            API.off(API.HISTORY_UPDATE, this.proxy.eventHistoryupdate);
        },
        startup: function () {
            Function.prototype.toString = function () {
                return 'Function.'
            };
            var u = API.getUser();
            if (ambient.userUtilities.getPermission(u) < 2) return API.chatLog(ambient.chat.greyuser);
            if (ambient.userUtilities.getPermission(u) === 2) API.chatLog(ambient.chat.bouncer);
            ambient.connectAPI();
            API.moderateDeleteChat = function (cid) {
                $.ajax({
                    url: "https://plug.dj/_/chat/" + cid,
                    type: "DELETE"
                })
            };

            var roomURL = window.location.pathname;
            var Check;

            var detect = function(){
                if(roomURL != window.location.pathname){
                    clearInterval(Check)
                    console.log("Killing bot after room change.");
                    storeToStorage();
                    ambient.disconnectAPI();
                    setTimeout(function () {
                        kill();
                    }, 1000);
                }
            };
            
            var autoCAFK = function(){
                var d = new Date();
                var n = d.getHours();
                if (n === 24 && ambient.settings.afkRemoval) {
                    ambient.settings.afkRemoval = !ambient.settings.afkRemoval;
                    clearInterval(ambient.room.afkInterval);
                    API.sendChat('/me AFK Removal has been automatically disabled as it is midnight (EST)');
                }
                if (n === 8 && !ambient.settings.afkRemoval){
                    ambient.settings.afkRemoval = !ambient.settings.afkRemoval;
                    ambient.room.afkInterval = setInterval(function () {
                                ambient.roomUtilities.afkCheck()
                            }, 2 * 1000);
                    API.sendChat('/me AFK Removal has been automatically enabled as it is 8AM (EST)');
                }
            };

            Check = setInterval(function(){ detect() }, 100);
            var cafkr;
            cafkr = setInterval(function(){ autoCAFK() }, 60000);
            retrieveSettings();
            retrieveFromStorage();
            window.bot = ambient;
            ambient.roomUtilities.updateBlacklists();
            setInterval(ambient.roomUtilities.updateBlacklists, 60 * 60 * 1000);
            ambient.getNewBlacklistedSongs = ambient.roomUtilities.exportNewBlacklistedSongs;
            ambient.logNewBlacklistedSongs = ambient.roomUtilities.logNewBlacklistedSongs;
            if (ambient.room.roomstats.launchTime === null) {
                ambient.room.roomstats.launchTime = Date.now();
            }

            for (var j = 0; j < ambient.room.users.length; j++) {
                ambient.room.users[j].inRoom = false;
            }
            var userlist = API.getUsers();
            for (var i = 0; i < userlist.length; i++) {
                var known = false;
                var ind = null;
                for (var j = 0; j < ambient.room.users.length; j++) {
                    if (ambient.room.users[j].id === userlist[i].id) {
                        known = true;
                        ind = j;
                    }
                }
                if (known) {
                    ambient.room.users[ind].inRoom = true;
                }
                else {
                    ambient.room.users.push(new ambient.User(userlist[i].id, userlist[i].username));
                    ind = ambient.room.users.length - 1;
                }
                var wlIndex = API.getWaitListPosition(ambient.room.users[ind].id) + 1;
                ambient.userUtilities.updatePosition(ambient.room.users[ind], wlIndex);
            }
            ambient.room.afkInterval = setInterval(function () {
                ambient.roomUtilities.afkCheck()
            }, 10 * 1000);
            ambient.room.autodisableInterval = setInterval(function () {
                ambient.room.autodisableFunc();
            }, 60 * 60 * 1000);
            ambient.loggedInID = API.getUser().id;
            ambient.status = true;
            API.sendChat('/cap ' + ambient.settings.startupCap);
            API.setVolume(ambient.settings.startupVolume);
            $("#woot").click();
            if (ambient.settings.startupEmoji) {
                var emojibuttonoff = $(".icon-emoji-off");
                if (emojibuttonoff.length > 0) {
                    emojibuttonoff[0].click();
                }
                API.chatLog(':smile: Emojis enabled.');
            }
            else {
                var emojibuttonon = $(".icon-emoji-on");
                if (emojibuttonon.length > 0) {
                    emojibuttonon[0].click();
                }
                API.chatLog('Emojis disabled.');
            }
            API.chatLog('Avatars capped at ' + ambient.settings.startupCap);
            API.chatLog('Volume set to ' + ambient.settings.startupVolume);
            loadChat(API.sendChat(subChat(ambient.chat.online, {botname: ambient.settings.botName, version: ambient.version})));
        },
        commands: {
            executable: function (minRank, chat) {
                var id = chat.uid;
                var perm = ambient.userUtilities.getPermission(id);
                var minPerm;
                switch (minRank) {
                    case 'admin':
                        minPerm = 10;
                        break;
                    case 'ambassador':
                        minPerm = 7;
                        break;
                    case 'host':
                        minPerm = 5;
                        break;
                    case 'cohost':
                        minPerm = 4;
                        break;
                    case 'manager':
                        minPerm = 3;
                        break;
                    case 'mod':
                        if (ambient.settings.bouncerPlus) {
                            minPerm = 2;
                        }
                        else {
                            minPerm = 3;
                        }
                        break;
                    case 'bouncer':
                        minPerm = 2;
                        break;
                    case 'residentdj':
                        minPerm = 1;
                        break;
                    case 'user':
                        minPerm = 0;
                        break;
                    default:
                        API.chatLog('error assigning minimum permission');
                }
                return perm >= minPerm;

            },
            /**
             command: {
                        command: 'cmd',
                        rank: 'user/bouncer/mod/manager',
                        type: 'startsWith/exact',
                        functionality: function(chat, cmd){
                                if(this.type === 'exact' && chat.message.length !== cmd.length) return void (0);
                                if( !ambient.commands.executable(this.rank, chat) ) return void (0);
                                else{
                                
                                }
                        }
                },
             **/

            activeCommand: {
                command: 'active',
                rank: 'bouncer',
                type: 'startsWith',
                functionality: function (chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void (0);
                    if (!ambient.commands.executable(this.rank, chat)) return void (0);
                    else {
                        var msg = chat.message;
                        var now = Date.now();
                        var chatters = 0;
                        var time;
                        if (msg.length === cmd.length) time = 60;
                        else {
                            time = msg.substring(cmd.length + 1);
                            if (isNaN(time)) return API.sendChat(subChat(ambient.chat.invalidtime, {name: chat.un}));
                        }
                        for (var i = 0; i < ambient.room.users.length; i++) {
                            userTime = ambient.userUtilities.getLastActivity(ambient.room.users[i]);
                            if ((now - userTime) <= (time * 60 * 1000)) {
                                chatters++;
                            }
                        }
                        API.sendChat(subChat(ambient.chat.activeusersintime, {name: chat.un, amount: chatters, time: time}));
                    }
                }
            },

            addCommand: {
                command: 'add',
                rank: 'mod',
                type: 'startsWith',
                functionality: function (chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void (0);
                    if (!ambient.commands.executable(this.rank, chat)) return void (0);
                    else {
                        var msg = chat.message;
                        if (msg.length === cmd.length) return API.sendChat(subChat(ambient.chat.nouserspecified, {name: chat.un}));
                        var name = msg.substr(cmd.length + 2);
                        var user = ambient.userUtilities.lookupUserName(name);
                        if (msg.length > cmd.length + 2) {
                            if (typeof user !== 'undefined') {
                                if (ambient.room.roomevent) {
                                    ambient.room.eventArtists.push(user.id);
                                }
                                API.moderateAddDJ(user.id);
                            } else API.sendChat(subChat(ambient.chat.invaliduserspecified, {name: chat.un}));
                        }
                    }
                }
            },

            afklimitCommand: {
                command: 'afklimit',
                rank: 'manager',
                type: 'startsWith',
                functionality: function (chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void (0);
                    if (!ambient.commands.executable(this.rank, chat)) return void (0);
                    else {
                        var msg = chat.message;
                        if (msg.length === cmd.length) return API.sendChat(subChat(ambient.chat.nolimitspecified, {name: chat.un}));
                        var limit = msg.substring(cmd.length + 1);
                        if (!isNaN(limit)) {
                            ambient.settings.maximumAfk = parseInt(limit, 10);
                            API.sendChat(subChat(ambient.chat.maximumafktimeset, {name: chat.un, time: ambient.settings.maximumAfk}));
                        }
                        else API.sendChat(subChat(ambient.chat.invalidlimitspecified, {name: chat.un}));
                    }
                }
            },

            afkremovalCommand: {
                command: 'afkremoval',
                rank: 'mod',
                type: 'exact',
                functionality: function (chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void (0);
                    if (!ambient.commands.executable(this.rank, chat)) return void (0);
                    else {
                        if (ambient.settings.afkRemoval) {
                            ambient.settings.afkRemoval = !ambient.settings.afkRemoval;
                            clearInterval(ambient.room.afkInterval);
                            API.sendChat(subChat(ambient.chat.toggleoff, {name: chat.un, 'function': ambient.chat.afkremoval}));
                        }
                        else {
                            ambient.settings.afkRemoval = !ambient.settings.afkRemoval;
                            ambient.room.afkInterval = setInterval(function () {
                                ambient.roomUtilities.afkCheck()
                            }, 2 * 1000);
                            API.sendChat(subChat(ambient.chat.toggleon, {name: chat.un, 'function': ambient.chat.afkremoval}));
                        }
                    }
                }
            },

            afkresetCommand: {
                command: 'afkreset',
                rank: 'bouncer',
                type: 'startsWith',
                functionality: function (chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void (0);
                    if (!ambient.commands.executable(this.rank, chat)) return void (0);
                    else {
                        var msg = chat.message;
                        if (msg.length === cmd.length) return API.sendChat(subChat(ambient.chat.nouserspecified, {name: chat.un}));
                        var name = msg.substring(cmd.length + 2);
                        var user = ambient.userUtilities.lookupUserName(name);
                        if (typeof user === 'boolean') return API.sendChat(subChat(ambient.chat.invaliduserspecified, {name: chat.un}));
                        ambient.userUtilities.setLastActivity(user);
                        API.sendChat(subChat(ambient.chat.afkstatusreset, {name: chat.un, username: name}));
                    }
                }
            },

            afktimeCommand: {
                command: 'afktime',
                rank: 'bouncer',
                type: 'startsWith',
                functionality: function (chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void (0);
                    if (!ambient.commands.executable(this.rank, chat)) return void (0);
                    else {
                        var msg = chat.message;
                        if (msg.length === cmd.length) return API.sendChat(subChat(ambient.chat.nouserspecified, {name: chat.un}));
                        var name = msg.substring(cmd.length + 2);
                        var user = ambient.userUtilities.lookupUserName(name);
                        if (typeof user === 'boolean') return API.sendChat(subChat(ambient.chat.invaliduserspecified, {name: chat.un}));
                        var lastActive = ambient.userUtilities.getLastActivity(user);
                        var inactivity = Date.now() - lastActive;
                        var time = ambient.roomUtilities.msToStr(inactivity);

                        var launchT = ambient.room.roomstats.launchTime;
                        var durationOnline = Date.now() - launchT;

                        if (inactivity == durationOnline){
                            API.sendChat(subChat(ambient.chat.inactivelonger, {botname: ambient.settings.botName, name: chat.un, username: name}));
                        } else {
                            API.sendChat(subChat(ambient.chat.inactivefor, {name: chat.un, username: name, time: time}));
                        }
                    }
                }
            },

            autodisableCommand: {
                command: 'autodisable',
                rank: 'bouncer',
                type: 'exact',
                functionality: function (chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void (0);
                    if (!ambient.commands.executable(this.rank, chat)) return void (0);
                    else {
                        if (ambient.settings.autodisable) {
                            ambient.settings.autodisable = !ambient.settings.autodisable;
                            return API.sendChat(subChat(ambient.chat.toggleoff, {name: chat.un, 'function': ambient.chat.autodisable}));
                        }
                        else {
                            ambient.settings.autodisable = !ambient.settings.autodisable;
                            return API.sendChat(subChat(ambient.chat.toggleon, {name: chat.un, 'function': ambient.chat.autodisable}));
                        }

                    }
                }
            },

            autoskipCommand: {
                command: 'autoskip',
                rank: 'mod',
                type: 'exact',
                functionality: function (chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void (0);
                    if (!ambient.commands.executable(this.rank, chat)) return void (0);
                    else {
                        if (ambient.room.autoskip) {
                            ambient.room.autoskip = !ambient.room.autoskip;
                            clearTimeout(ambient.room.autoskipTimer);
                            return API.sendChat(subChat(ambient.chat.toggleoff, {name: chat.un, 'function': ambient.chat.autoskip}));
                        }
                        else {
                            ambient.room.autoskip = !ambient.room.autoskip;
                            return API.sendChat(subChat(ambient.chat.toggleon, {name: chat.un, 'function': ambient.chat.autoskip}));
                        }
                    }
                }
            },

            autowootCommand: {
                command: 'autowoot',
                rank: 'user',
                type: 'exact',
                functionality: function (chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void (0);
                    if (!ambient.commands.executable(this.rank, chat)) return void (0);
                    else {
                        API.sendChat(ambient.chat.autowoot);
                    }
                }
            },

            baCommand: {
                command: 'ba',
                rank: 'user',
                type: 'exact',
                functionality: function (chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void (0);
                    if (!ambient.commands.executable(this.rank, chat)) return void (0);
                    else {
                        API.sendChat(ambient.chat.brandambassador);
                    }
                }
            },

            ballCommand: {
                command: ['8ball', 'ask'],
                rank: 'user',
                type: 'startsWith',
                functionality: function (chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void (0);
                    if (!ambient.commands.executable(this.rank, chat)) return void (0);
                    else {
                        var crowd = API.getUsers();
                        var msg = chat.message;
                        var argument = msg.substring(cmd.length + 1);
                        var randomUser = Math.floor(Math.random() * crowd.length);
                        var randomBall = Math.floor(Math.random() * ambient.chat.balls.length);
                        var randomSentence = Math.floor(Math.random() * 1);
                        API.sendChat(subChat(ambient.chat.ball, {name: chat.un, botname: ambient.settings.botName, question: argument, response: ambient.chat.balls[randomBall]}));
                    }
                }
            },

            banCommand: {
                command: 'ban',
                rank: 'bouncer',
                type: 'startsWith',
                functionality: function (chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void (0);
                    if (!ambient.commands.executable(this.rank, chat)) return void (0);
                    else {
                        var msg = chat.message;
                        if (msg.length === cmd.length) return API.sendChat(subChat(ambient.chat.nouserspecified, {name: chat.un}));
                        var name = msg.substr(cmd.length + 2);
                        var user = ambient.userUtilities.lookupUserName(name);
                        if (typeof user === 'boolean') return API.sendChat(subChat(ambient.chat.invaliduserspecified, {name: chat.un}));
                        API.moderateBanUser(user.id, 1, API.BAN.DAY);
                    }
                }
            },

            blacklistCommand: {
                command: ['blacklist', 'bl'],
                rank: 'bouncer',
                type: 'startsWith',
                functionality: function (chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void (0);
                    if (!ambient.commands.executable(this.rank, chat)) return void (0);
                    else {
                        var msg = chat.message;
                        if (msg.length === cmd.length) return API.sendChat(subChat(ambient.chat.nolistspecified, {name: chat.un}));
                        var list = msg.substr(cmd.length + 1);
                        if (typeof ambient.room.blacklists[list] === 'undefined') return API.sendChat(subChat(ambient.chat.invalidlistspecified, {name: chat.un}));
                        else {
                            var media = API.getMedia();
                            var track = {
                                list: list,
                                author: media.author,
                                title: media.title,
                                mid: media.format + ':' + media.cid
                            };
                            ambient.room.newBlacklisted.push(track);
                            ambient.room.blacklists[list].push(media.format + ':' + media.cid);
                            API.sendChat(subChat(ambient.chat.newblacklisted, {name: chat.un, blacklist: list, author: media.author, title: media.title, mid: media.format + ':' + media.cid}));
                            API.moderateForceSkip();
                            if (typeof ambient.room.newBlacklistedSongFunction === 'function') {
                                ambient.room.newBlacklistedSongFunction(track);
                            }
                        }
                    }
                }
            },

            blinfoCommand: {
                command: 'blinfo',
                rank: 'bouncer',
                type: 'exact',
                functionality: function (chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void (0);
                    if (!ambient.commands.executable(this.rank, chat)) return void (0);
                    else {
                        var author = API.getMedia().author;
                        var title = API.getMedia().title;
                        var name = chat.un;
                        var format = API.getMedia().format;
                        var cid = API.getMedia().cid;
                        var songid = format + ":" + cid;

                        API.sendChat(subChat(ambient.chat.blinfo, {name: name, author: author, title: title, songid: songid}));
                    }
                }
            },

            bouncerPlusCommand: {
                command: 'bouncer+',
                rank: 'mod',
                type: 'exact',
                functionality: function (chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void (0);
                    if (!ambient.commands.executable(this.rank, chat)) return void (0);
                    else {
                        var msg = chat.message;
                        if (ambient.settings.bouncerPlus) {
                            ambient.settings.bouncerPlus = false;
                            return API.sendChat(subChat(ambient.chat.toggleoff, {name: chat.un, 'function': 'Bouncer+'}));
                        }
                        else {
                            if (!ambient.settings.bouncerPlus) {
                                var id = chat.uid;
                                var perm = ambient.userUtilities.getPermission(id);
                                if (perm > 2) {
                                    ambient.settings.bouncerPlus = true;
                                    return API.sendChat(subChat(ambient.chat.toggleon, {name: chat.un, 'function': 'Bouncer+'}));
                                }
                            }
                            else return API.sendChat(subChat(ambient.chat.bouncerplusrank, {name: chat.un}));
                        }
                    }
                }
            },

            botnameCommand: {
                command: 'botname',
                rank: 'manager',
                type: 'startsWith',
                functionality: function (chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void (0);
                    if (!ambient.commands.executable(this.rank, chat)) return void (0);
                    else {
                        var msg = chat.message;
                        if (msg.length <= cmd.length + 1) return API.sendChat(subChat(ambient.chat.currentbotname, {botname: ambient.settings.botName}));
                        var argument = msg.substring(cmd.length + 1);
                        if (argument) {
                            ambient.settings.botName = argument;
                            API.sendChat(subChat(ambient.chat.botnameset, {botName: ambient.settings.botName}));
                        }
                    }
                }
            },

            clearchatCommand: {
                command: 'clearchat',
                rank: 'manager',
                type: 'exact',
                functionality: function (chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void (0);
                    if (!ambient.commands.executable(this.rank, chat)) return void (0);
                    else {
                        var currentchat = $('#chat-messages').children();
                        for (var i = 0; i < currentchat.length; i++) {
                            API.moderateDeleteChat(currentchat[i].getAttribute("data-cid"));
                            API.chatLog('deletion 8');
                        }
                        return API.sendChat(subChat(ambient.chat.chatcleared, {name: chat.un}));
                    }
                }
            },

            commandsCommand: {
                command: 'commands',
                rank: 'user',
                type: 'exact',
                functionality: function (chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void (0);
                    if (!ambient.commands.executable(this.rank, chat)) return void (0);
                    else {
                        API.sendChat('/me A list of all available commands can be found here: https://github.com/Paradox68/AmbientBot/blob/master/commands.md');
                    }
                }
            },

            cmddeletionCommand: {
                command: ['commanddeletion', 'cmddeletion', 'cmddel'],
                rank: 'mod',
                type: 'exact',
                functionality: function (chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void (0);
                    if (!ambient.commands.executable(this.rank, chat)) return void (0);
                    else {
                        if (ambient.settings.cmdDeletion) {
                            ambient.settings.cmdDeletion = !ambient.settings.cmdDeletion;
                            API.sendChat(subChat(ambient.chat.toggleoff, {name: chat.un, 'function': ambient.chat.cmddeletion}));
                        }
                        else {
                            ambient.settings.cmdDeletion = !ambient.settings.cmdDeletion;
                            API.sendChat(subChat(ambient.chat.toggleon, {name: chat.un, 'function': ambient.chat.cmddeletion}));
                        }
                    }
                }
            },

            cookieCommand: {
                command: 'cookie',
                rank: 'user',
                type: 'startsWith',
                getCookie: function (chat) {
                    var c = Math.floor(Math.random() * ambient.chat.cookies.length);
                    return ambient.chat.cookies[c];
                },
                functionality: function (chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void (0);
                    if (!ambient.commands.executable(this.rank, chat)) return void (0);
                    else {
                        var msg = chat.message;

                        var space = msg.indexOf(' ');
                        if (space === -1) {
                            API.sendChat(ambient.chat.eatcookie);
                            return false;
                        }
                        else {
                            var name = msg.substring(space + 2);
                            var user = ambient.userUtilities.lookupUserName(name);
                            if (user === false || !user.inRoom) {
                                return API.sendChat(subChat(ambient.chat.nousercookie, {name: name}));
                            }
                            else if (user.username === chat.un) {
                                return API.sendChat(subChat(ambient.chat.selfcookie, {name: name}));
                            }
                            else {
                                return API.sendChat(subChat(ambient.chat.cookie, {nameto: user.username, namefrom: chat.un, cookie: this.getCookie()}));
                            }
                        }
                    }
                }
            },

            cycleCommand: {
                command: 'cycle',
                rank: 'mod',
                type: 'exact',
                functionality: function (chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void (0);
                    if (!ambient.commands.executable(this.rank, chat)) return void (0);
                    else {
                        ambient.roomUtilities.changeDJCycle();
                    }
                }
            },

            cycleguardCommand: {
                command: 'cycleguard',
                rank: 'bouncer',
                type: 'exact',
                functionality: function (chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void (0);
                    if (!ambient.commands.executable(this.rank, chat)) return void (0);
                    else {
                        if (ambient.settings.cycleGuard) {
                            ambient.settings.cycleGuard = !ambient.settings.cycleGuard;
                            return API.sendChat(subChat(ambient.chat.toggleoff, {name: chat.un, 'function': ambient.chat.cycleguard}));
                        }
                        else {
                            ambient.settings.cycleGuard = !ambient.settings.cycleGuard;
                            return API.sendChat(subChat(ambient.chat.toggleon, {name: chat.un, 'function': ambient.chat.cycleguard}));
                        }

                    }
                }
            },

            cycletimerCommand: {
                command: 'cycletimer',
                rank: 'manager',
                type: 'startsWith',
                functionality: function (chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void (0);
                    if (!ambient.commands.executable(this.rank, chat)) return void (0);
                    else {
                        var msg = chat.message;
                        var cycleTime = msg.substring(cmd.length + 1);
                        if (!isNaN(cycleTime) && cycleTime !== "") {
                            ambient.settings.maximumCycletime = cycleTime;
                            return API.sendChat(subChat(ambient.chat.cycleguardtime, {name: chat.un, time: ambient.settings.maximumCycletime}));
                        }
                        else return API.sendChat(subChat(ambient.chat.invalidtime, {name: chat.un}));

                    }
                }
            },

            dclookupCommand: {
                command: ['dclookup', 'dc'],
                rank: 'user',
                type: 'startsWith',
                functionality: function (chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void (0);
                    if (!ambient.commands.executable(this.rank, chat)) return void (0);
                    else {
                        var msg = chat.message;
                        var name;
                        if (msg.length === cmd.length) name = chat.un;
                        else {
                            name = msg.substring(cmd.length + 2);
                            var perm = ambient.userUtilities.getPermission(chat.uid);
                            if (perm < 2) return API.sendChat(subChat(ambient.chat.dclookuprank, {name: chat.un}));
                        }
                        var user = ambient.userUtilities.lookupUserName(name);
                        if (typeof user === 'boolean') return API.sendChat(subChat(ambient.chat.invaliduserspecified, {name: chat.un}));
                        var toChat = ambient.userUtilities.dclookup(user.id);
                        API.sendChat(toChat);
                    }
                }
            },

            /*deletechatCommand: {
             command: 'deletechat',
             rank: 'mod',
             type: 'startsWith',
             functionality: function (chat, cmd) {
             if (this.type === 'exact' && chat.message.length !== cmd.length) return void (0);
             if (!ambient.commands.executable(this.rank, chat)) return void (0);
             else {
             var msg = chat.message;
             if (msg.length === cmd.length) return API.sendChat(subChat(ambient.chat.nouserspecified, {name: chat.un}));
             var name = msg.substring(cmd.length + 2);
             var user = ambient.userUtilities.lookupUserName(name);
             if (typeof user === 'boolean') return API.sendChat(subChat(ambient.chat.invaliduserspecified, {name: chat.un}));
             var chats = $('.from');
             var message = $('.message');
             var emote = $('.emote');
             var from = $('.un.clickable');
             for (var i = 0; i < chats.length; i++) {
             var n = from[i].textContent;
             if (name.trim() === n.trim()) {
             // var messagecid = $(message)[i].getAttribute('data-cid');
             // var emotecid = $(emote)[i].getAttribute('data-cid');
             // API.moderateDeleteChat(messagecid);
             // try {
             //     API.moderateDeleteChat(messagecid);
             // }
             // finally {
             //     API.moderateDeleteChat(emotecid);
             // }
             if (typeof $(message)[i].getAttribute('data-cid') == "undefined"){
             API.moderateDeleteChat($(emote)[i].getAttribute('data-cid')); // works well with normal messages but not with emotes due to emotes and messages are seperate.
             } else {
             API.moderateDeleteChat($(message)[i].getAttribute('data-cid'));
             }
             }
             }
             API.sendChat(subChat(ambient.chat.deletechat, {name: chat.un, username: name}));
             }
             }
             },*/

            emojiCommand: {
                command: 'emoji',
                rank: 'user',
                type: 'exact',
                functionality: function (chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void (0);
                    if (!ambient.commands.executable(this.rank, chat)) return void (0);
                    else {
                        var link = 'http://www.emoji-cheat-sheet.com/';
                        API.sendChat(subChat(ambient.chat.emojilist, {link: link}));
                    }
                }
            },

            englishCommand: {
                command: 'english',
                rank: 'bouncer',
                type: 'startsWith',
                functionality: function (chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void (0);
                    if (!ambient.commands.executable(this.rank, chat)) return void (0);
                    else {
                        if(chat.message.length === cmd.length) return API.sendChat('/me No user specified.');
                        var name = chat.message.substring(cmd.length + 2);
                        var user = ambient.userUtilities.lookupUserName(name);
                        if(typeof user === 'boolean') return API.sendChat('/me Invalid user specified.');
                        var lang = ambient.userUtilities.getUser(user).language;
                        var ch = '/me @' + name + ' ';
                        switch(lang){
                            case 'en': break;
                            case 'da': ch += 'Vær venlig at tale engelsk.'; break;
                            case 'de': ch += 'Bitte sprechen Sie Englisch.'; break;
                            case 'es': ch += 'Por favor, hable Inglés.'; break;
                            case 'fr': ch += 'Parlez anglais, s\'il vous plaît.'; break;
                            case 'nl': ch += 'Spreek Engels, alstublieft.'; break;
                            case 'pl': ch += 'Proszę mówić po angielsku.'; break;
                            case 'pt': ch += 'Por favor, fale Inglês.'; break;
                            case 'sk': ch += 'Hovorte po anglicky, prosím.'; break;
                            case 'cs': ch += 'Mluvte prosím anglicky.'; break;
                            case 'sr': ch += 'Молим Вас, говорите енглески.'; break;
                        }
                        ch += ' English please.';
                        API.sendChat(ch);
                    }
                }
            },

            etaCommand: {
                command: 'eta',
                rank: 'user',
                type: 'startsWith',
                functionality: function (chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void (0);
                    if (!ambient.commands.executable(this.rank, chat)) return void (0);
                    else {
                        var perm = ambient.userUtilities.getPermission(chat.uid);
                        var msg = chat.message;
                        var name;
                        if (msg.length > cmd.length) {
                            if (perm < 2) return void (0);
                            name = msg.substring(cmd.length + 2);
                        } else name = chat.un;
                        var user = ambient.userUtilities.lookupUserName(name);
                        if (typeof user === 'boolean') return API.sendChat(subChat(ambient.chat.invaliduserspecified, {name: chat.un}));
                        var pos = API.getWaitListPosition(user.id);
                        if (pos < 0) return API.sendChat(subChat(ambient.chat.notinwaitlist, {name: name}));
                        var timeRemaining = API.getTimeRemaining();
                        var estimateMS = ((pos + 1) * 4 * 60 + timeRemaining) * 1000;
                        var estimateString = ambient.roomUtilities.msToStr(estimateMS);
                        API.sendChat(subChat(ambient.chat.eta, {name: name, time: estimateString}));
                    }
                }
            },

            fbCommand: {
                command: 'fb',
                rank: 'user',
                type: 'exact',
                functionality: function (chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void (0);
                    if (!ambient.commands.executable(this.rank, chat)) return void (0);
                    else {
                        if (typeof ambient.settings.fbLink === "string")
                            API.sendChat(subChat(ambient.chat.facebook, {link: ambient.settings.fbLink}));
                    }
                }
            },

            filterCommand: {
                command: 'filter',
                rank: 'bouncer',
                type: 'exact',
                functionality: function (chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void (0);
                    if (!ambient.commands.executable(this.rank, chat)) return void (0);
                    else {
                        if (ambient.settings.filterChat) {
                            ambient.settings.filterChat = !ambient.settings.filterChat;
                            return API.sendChat(subChat(ambient.chat.toggleoff, {name: chat.un, 'function': ambient.chat.chatfilter}));
                        }
                        else {
                            ambient.settings.filterChat = !ambient.settings.filterChat;
                            return API.sendChat(subChat(ambient.chat.toggleon, {name: chat.un, 'function': ambient.chat.chatfilter}));
                        }
                    }
                }
            },

            ghostbusterCommand: {
                command: 'ghostbuster',
                rank: 'user',
                type: 'startsWith',
                functionality: function (chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void (0);
                    if (!ambient.commands.executable(this.rank, chat)) return void (0);
                    else {
                        var msg = chat.message;
                        var name;
                        if (msg.length === cmd.length) name = chat.un;
                        else {
                            name = msg.substr(cmd.length + 2);
                        }
                        var user = ambient.userUtilities.lookupUserName(name);
                        if (user === false || !user.inRoom) {
                            return API.sendChat(subChat(ambient.chat.ghosting, {name1: chat.un, name2: name}));
                        }
                        else API.sendChat(subChat(ambient.chat.notghosting, {name1: chat.un, name2: name}));
                    }
                }
            },

            gifCommand: {
                command: ['gif', 'giphy'],
                rank: 'user',
                type: 'startsWith',
                functionality: function (chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void (0);
                    if (!ambient.commands.executable(this.rank, chat)) return void (0);
                    else {
                        var msg = chat.message;
                        if (msg.length !== cmd.length) {
                            function get_id(api_key, fixedtag, func)
                            {
                                $.getJSON(
                                    "https://tv.giphy.com/v1/gifs/random?",
                                    {
                                        "format": "json",
                                        "api_key": api_key,
                                        "rating": rating,
                                        "tag": fixedtag
                                    },
                                    function(response)
                                    {
                                        func(response.data.id);
                                    }
                                )
                            }
                            var api_key = "dc6zaTOxFJmzC"; // public beta key
                            var rating = "PG-13"; // PG 13 gifs
                            var tag = msg.substr(cmd.length + 1);
                            var fixedtag = tag.replace(/ /g,"+");
                            var commatag = tag.replace(/ /g,", ");
                            get_id(api_key, tag, function(id) {
                                if (typeof id !== 'undefined') {
                                    API.sendChat(subChat(ambient.chat.validgiftags, {name: chat.un, id: id, tags: commatag}));
                                } else {
                                    API.sendChat(subChat(ambient.chat.invalidgiftags, {name: chat.un, tags: commatag}));
                                }
                            });
                        }
                        else {
                            function get_random_id(api_key, func)
                            {
                                $.getJSON(
                                    "https://tv.giphy.com/v1/gifs/random?",
                                    {
                                        "format": "json",
                                        "api_key": api_key,
                                        "rating": rating
                                    },
                                    function(response)
                                    {
                                        func(response.data.id);
                                    }
                                )
                            }
                            var api_key = "dc6zaTOxFJmzC"; // public beta key
                            var rating = "PG-13"; // PG 13 gifs
                            get_random_id(api_key, function(id) {
                                if (typeof id !== 'undefined') {
                                    API.sendChat(subChat(ambient.chat.validgifrandom, {name: chat.un, id: id}));
                                } else {
                                    API.sendChat(subChat(ambient.chat.invalidgifrandom, {name: chat.un}));
                                }
                            });
                        }
                    }
                }
            },

            helpCommand: {
                command: 'help',
                rank: 'user',
                type: 'exact',
                functionality: function (chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void (0);
                    if (!ambient.commands.executable(this.rank, chat)) return void (0);
                    else {
                        var link = "(Updated link coming soon)";
                        API.sendChat(subChat(ambient.chat.starterhelp, {link: link}));
                    }
                }
            },

            historyskipCommand: {
                command: 'historyskip',
                rank: 'bouncer',
                type: 'exact',
                functionality: function (chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void (0);
                    if (!ambient.commands.executable(this.rank, chat)) return void (0);
                    else {
                        if (ambient.settings.historySkip) {
                            ambient.settings.historySkip = !ambient.settings.historySkip;
                            API.sendChat(subChat(ambient.chat.toggleoff, {name: chat.un, 'function': ambient.chat.historyskip}));
                        }
                        else {
                            ambient.settings.historySkip = !ambient.settings.historySkip;
                            API.sendChat(subChat(ambient.chat.toggleon, {name: chat.un, 'function': ambient.chat.historyskip}));
                        }
                    }
                }
            },

            /*                  russianCommand: {
             command: 'russian',
             rank: 'mod',
             type: 'exact',
             functionality: function (chat, cmd) {
             if (this.type === 'exact' && chat.message.length !== cmd.length) return void (0);
             if (!ambient.commands.executable(this.rank, chat)) return void (0);
             else {
             if (!ambient.room.russiangame.RRStatus) {
             ambient.room.russiangame.startRussianGame();
             }
             }
             }
             },
             /*
             sitCommand: {
             command: 'sit',
             rank: 'user',
             type: 'exact',
             functionality: function (chat, cmd) {
             if (this.type === 'exact' && chat.message.length !== cmd.length) { return void (0); }
             if (!ambient.commands.executable(this.rank, chat)) { return void (0); }
             if (ambient.room.russiangame.players >= 6) { return void (0); }
             if (ambient.room.russiangame.started) { return void (0); }
             if (ambient.room.russiangame.rusStatus && ambient.room.russiangame.participants.indexOf(chat.uid) < 0) {
             ambient.room.russiangame.participants.push(chat.uid);
             API.sendChat('/me ' + chat.un + ' has claimed his seat in Russian Roulette');
             ambient.room.russiangame.players += 1;
             if (ambient.room.russiangame.players == 6) {
             ambient.room.russiangame.started = true;
             }
             }
             }
             },*/

            joinCommand: {
                command: 'join',
                rank: 'user',
                type: 'exact',
                functionality: function (chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void (0);
                    if (!ambient.commands.executable(this.rank, chat)) return void (0);
                    else {
                        if (ambient.room.roulette.rouletteStatus && ambient.room.roulette.participants.indexOf(chat.uid) < 0) {
                            ambient.room.roulette.participants.push(chat.uid);
                            API.sendChat(subChat(ambient.chat.roulettejoin, {name: chat.un}));
                        }
                    }
                }
            },



            jointimeCommand: {
                command: 'jointime',
                rank: 'bouncer',
                type: 'startsWith',
                functionality: function (chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void (0);
                    if (!ambient.commands.executable(this.rank, chat)) return void (0);
                    else {
                        var msg = chat.message;
                        if (msg.length === cmd.length) return API.sendChat(subChat(ambient.chat.nouserspecified, {name: chat.un}));
                        var name = msg.substring(cmd.length + 2);
                        var user = ambient.userUtilities.lookupUserName(name);
                        if (typeof user === 'boolean') return API.sendChat(subChat(ambient.chat.invaliduserspecified, {name: chat.un}));
                        var join = ambient.userUtilities.getJointime(user);
                        var time = Date.now() - join;
                        var timeString = ambient.roomUtilities.msToStr(time);
                        API.sendChat(subChat(ambient.chat.jointime, {namefrom: chat.un, username: name, time: timeString}));
                    }
                }
            },

            kickCommand: {
                command: 'kick',
                rank: 'bouncer',
                type: 'startsWith',
                functionality: function (chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void (0);
                    if (!ambient.commands.executable(this.rank, chat)) return void (0);
                    else {
                        var msg = chat.message;
                        var lastSpace = msg.lastIndexOf(' ');
                        var time;
                        var name;
                        if (lastSpace === msg.indexOf(' ')) {
                            time = 0.25;
                            name = msg.substring(cmd.length + 2);
                        }
                        else {
                            time = msg.substring(lastSpace + 1);
                            name = msg.substring(cmd.length + 2, lastSpace);
                        }

                        var user = ambient.userUtilities.lookupUserName(name);
                        var from = chat.un;
                        if (typeof user === 'boolean') return API.sendChat(subChat(ambient.chat.nouserspecified, {name: chat.un}));

                        var permFrom = ambient.userUtilities.getPermission(chat.uid);
                        var permTokick = ambient.userUtilities.getPermission(user.id);

                        if (permFrom <= permTokick)
                            return API.sendChat(subChat(ambient.chat.kickrank, {name: chat.un}));

                        if (!isNaN(time)) {
                            API.sendChat(subChat(ambient.chat.kick, {name: chat.un, username: name, time: time}));
                            if (time > 24 * 60 * 60) API.moderateBanUser(user.id, 1, API.BAN.PERMA);
                            else API.moderateBanUser(user.id, 1, API.BAN.DAY);
                            setTimeout(function (id, name) {
                                API.moderateUnbanUser(id);
                                console.log('Unbanned @' + name + '. (' + id + ')');
                            }, time * 60 * 1000, user.id, name);
                        }
                        else API.sendChat(subChat(ambient.chat.invalidtime, {name: chat.un}));
                    }
                }
            },

            killCommand: {
                command: 'kill',
                rank: 'bouncer',
                type: 'exact',
                functionality: function (chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void (0);
                    if (!ambient.commands.executable(this.rank, chat)) return void (0);
                    else {
                        storeToStorage();
                        API.sendChat(ambient.chat.kill);
                        ambient.disconnectAPI();
                        setTimeout(function () {
                            kill();
                        }, 1000);
                    }
                }
            },

            languageCommand: {
                command: 'language',
                rank: 'manager',
                type: 'startsWith',
                functionality: function (chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void (0);
                    if (!ambient.commands.executable(this.rank, chat)) return void (0);
                    else {
                        var msg = chat.message;
                        if (msg.length <= cmd.length + 1) return API.sendChat(subChat(ambient.chat.currentlang, {language: ambient.settings.language}));
                        var argument = msg.substring(cmd.length + 1);

                        $.get("https://rawgit.com/Paradox68/AmbientBot/master/lang/langIndex.json", function (json) {
                            var langIndex = json;
                            var link = langIndex[argument.toLowerCase()];
                            if (typeof link === "undefined") {
                                API.sendChat(subChat(ambient.chat.langerror, {link: "http://git.io/vJ9nI"}));
                            }
                            else {
                                ambient.settings.language = argument;
                                loadChat();
                                API.sendChat(subChat(ambient.chat.langset, {language: ambient.settings.language}));
                            }
                        });
                    }
                }
            },

            leaveCommand: {
                command: 'leave',
                rank: 'user',
                type: 'exact',
                functionality: function (chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void (0);
                    if (!ambient.commands.executable(this.rank, chat)) return void (0);
                    else {
                        var ind = ambient.room.roulette.participants.indexOf(chat.uid);
                        if (ind > -1) {
                            ambient.room.roulette.participants.splice(ind, 1);
                            API.sendChat(subChat(ambient.chat.rouletteleave, {name: chat.un}));
                        }
                    }
                }
            },

            linkCommand: {
                command: 'link',
                rank: 'user',
                type: 'exact',
                functionality: function (chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void (0);
                    if (!ambient.commands.executable(this.rank, chat)) return void (0);
                    else {
                        var media = API.getMedia();
                        var from = chat.un;
                        var user = ambient.userUtilities.lookupUser(chat.uid);
                        var perm = ambient.userUtilities.getPermission(chat.uid);
                        var dj = API.getDJ().id;
                        var isDj = false;
                        if (dj === chat.uid) isDj = true;
                        if (perm >= 1 || isDj) {
                            if (media.format === 1) {
                                var linkToSong = "http://youtu.be/" + media.cid;
                                API.sendChat(subChat(ambient.chat.songlink, {name: from, link: linkToSong}));
                            }
                            if (media.format === 2) {
                                SC.get('/tracks/' + media.cid, function (sound) {
                                    API.sendChat(subChat(ambient.chat.songlink, {name: from, link: sound.permalink_url}));
                                });
                            }
                        }
                    }
                }
            },

            lockCommand: {
                command: 'lock',
                rank: 'mod',
                type: 'exact',
                functionality: function (chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void (0);
                    if (!ambient.commands.executable(this.rank, chat)) return void (0);
                    else {
                        ambient.roomUtilities.booth.lockBooth();
                    }
                }
            },

            lockdownCommand: {
                command: 'lockdown',
                rank: 'mod',
                type: 'exact',
                functionality: function (chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void (0);
                    if (!ambient.commands.executable(this.rank, chat)) return void (0);
                    else {
                        var temp = ambient.settings.lockdownEnabled;
                        ambient.settings.lockdownEnabled = !temp;
                        if (ambient.settings.lockdownEnabled) {
                            return API.sendChat(subChat(ambient.chat.toggleon, {name: chat.un, 'function': ambient.chat.lockdown}));
                        }
                        else return API.sendChat(subChat(ambient.chat.toggleoff, {name: chat.un, 'function': ambient.chat.lockdown}));
                    }
                }
            },

            lockguardCommand: {
                command: 'lockguard',
                rank: 'bouncer',
                type: 'exact',
                functionality: function (chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void (0);
                    if (!ambient.commands.executable(this.rank, chat)) return void (0);
                    else {
                        if (ambient.settings.lockGuard) {
                            ambient.settings.lockGuard = !ambient.settings.lockGuard;
                            return API.sendChat(subChat(ambient.chat.toggleoff, {name: chat.un, 'function': ambient.chat.lockguard}));
                        }
                        else {
                            ambient.settings.lockGuard = !ambient.settings.lockGuard;
                            return API.sendChat(subChat(ambient.chat.toggleon, {name: chat.un, 'function': ambient.chat.lockguard}));
                        }
                    }
                }
            },

            lockskipCommand: {
                command: 'lockskip',
                rank: 'bouncer',
                type: 'startsWith',
                functionality: function (chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void (0);
                    if (!ambient.commands.executable(this.rank, chat)) return void (0);
                    else {
                        var dj = API.getDJ();
                        var id = dj.id;
                        var name = dj.username;
                        var msgSend = '@' + name + ': ';
                        ambient.room.queueable = false;

                        if (chat.message.length === cmd.length) {
                            API.sendChat(subChat(ambient.chat.usedlockskip, {name: chat.un}));
                            ambient.roomUtilities.booth.lockBooth();
                            setTimeout(function (id) {
                                API.moderateForceSkip();
                                ambient.room.skippable = false;
                                setTimeout(function () {
                                    ambient.room.skippable = true
                                }, 5 * 1000);
                                setTimeout(function (id) {
                                    ambient.userUtilities.moveUser(id, ambient.settings.lockskipPosition, false);
                                    ambient.room.queueable = true;
                                    setTimeout(function () {
                                        ambient.roomUtilities.booth.unlockBooth();
                                    }, 1000);
                                }, 1500, id);
                            }, 1000, id);
                            return void (0);
                        }
                        var validReason = false;
                        var msg = chat.message;
                        var reason = msg.substring(cmd.length + 1);
                        for (var i = 0; i < ambient.settings.lockskipReasons.length; i++) {
                            var r = ambient.settings.lockskipReasons[i][0];
                            if (reason.indexOf(r) !== -1) {
                                validReason = true;
                                msgSend += ambient.settings.lockskipReasons[i][1];
                            }
                        }
                        if (validReason) {
                            API.sendChat(subChat(ambient.chat.usedlockskip, {name: chat.un}));
                            ambient.roomUtilities.booth.lockBooth();
                            setTimeout(function (id) {
                                API.moderateForceSkip();
                                ambient.room.skippable = false;
                                API.sendChat(msgSend);
                                setTimeout(function () {
                                    ambient.room.skippable = true
                                }, 5 * 1000);
                                setTimeout(function (id) {
                                    ambient.userUtilities.moveUser(id, ambient.settings.lockskipPosition, false);
                                    ambient.room.queueable = true;
                                    setTimeout(function () {
                                        ambient.roomUtilities.booth.unlockBooth();
                                    }, 1000);
                                }, 1500, id);
                            }, 1000, id);
                            return void (0);
                        }
                    }
                }
            },

            lockskipposCommand: {
                command: 'lockskippos',
                rank: 'manager',
                type: 'startsWith',
                functionality: function (chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void (0);
                    if (!ambient.commands.executable(this.rank, chat)) return void (0);
                    else {
                        var msg = chat.message;
                        var pos = msg.substring(cmd.length + 1);
                        if (!isNaN(pos)) {
                            ambient.settings.lockskipPosition = pos;
                            return API.sendChat(subChat(ambient.chat.lockskippos, {name: chat.un, position: ambient.settings.lockskipPosition}));
                        }
                        else return API.sendChat(subChat(ambient.chat.invalidpositionspecified, {name: chat.un}));
                    }
                }
            },

            locktimerCommand: {
                command: 'locktimer',
                rank: 'manager',
                type: 'startsWith',
                functionality: function (chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void (0);
                    if (!ambient.commands.executable(this.rank, chat)) return void (0);
                    else {
                        var msg = chat.message;
                        var lockTime = msg.substring(cmd.length + 1);
                        if (!isNaN(lockTime) && lockTime !== "") {
                            ambient.settings.maximumLocktime = lockTime;
                            return API.sendChat(subChat(ambient.chat.lockguardtime, {name: chat.un, time: ambient.settings.maximumLocktime}));
                        }
                        else return API.sendChat(subChat(ambient.chat.invalidtime, {name: chat.un}));
                    }
                }
            },


            maxlengthCommand: {
                command: 'maxlength',
                rank: 'manager',
                type: 'startsWith',
                functionality: function (chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void (0);
                    if (!ambient.commands.executable(this.rank, chat)) return void (0);
                    else {
                        var msg = chat.message;
                        var maxTime = msg.substring(cmd.length + 1);
                        if (!isNaN(maxTime)) {
                            ambient.settings.maximumSongLength = maxTime;
                            return API.sendChat(subChat(ambient.chat.maxlengthtime, {name: chat.un, time: ambient.settings.maximumSongLength}));
                        }
                        else return API.sendChat(subChat(ambient.chat.invalidtime, {name: chat.un}));
                    }
                }
            },

            motdCommand: {
                command: 'motd',
                rank: 'bouncer',
                type: 'startsWith',
                functionality: function (chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void (0);
                    if (!ambient.commands.executable(this.rank, chat)) return void (0);
                    else {
                        var msg = chat.message;
                        if (msg.length <= cmd.length + 1) return API.sendChat('/me MotD: ' + ambient.settings.motd);
                        var argument = msg.substring(cmd.length + 1);
                        if (!ambient.settings.motdEnabled) ambient.settings.motdEnabled = !ambient.settings.motdEnabled;
                        if (isNaN(argument)) {
                            ambient.settings.motd = argument;
                            API.sendChat(subChat(ambient.chat.motdset, {msg: ambient.settings.motd}));
                        }
                        else {
                            ambient.settings.motdInterval = argument;
                            API.sendChat(subChat(ambient.chat.motdintervalset, {interval: ambient.settings.motdInterval}));
                        }
                    }
                }
            },

            moveCommand: {
                command: 'move',
                rank: 'mod',
                type: 'startsWith',
                functionality: function (chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void (0);
                    if (!ambient.commands.executable(this.rank, chat)) return void (0);
                    else {
                        var msg = chat.message;
                        if (msg.length === cmd.length) return API.sendChat(subChat(ambient.chat.nouserspecified, {name: chat.un}));
                        var firstSpace = msg.indexOf(' ');
                        var lastSpace = msg.lastIndexOf(' ');
                        var pos;
                        var name;
                        if (isNaN(parseInt(msg.substring(lastSpace + 1)))) {
                            pos = 1;
                            name = msg.substring(cmd.length + 2);
                        }
                        else {
                            pos = parseInt(msg.substring(lastSpace + 1));
                            name = msg.substring(cmd.length + 2, lastSpace);
                        }
                        var user = ambient.userUtilities.lookupUserName(name);
                        if (typeof user === 'boolean') return API.sendChat(subChat(ambient.chat.invaliduserspecified, {name: chat.un}));
                        if (user.id === ambient.loggedInID) return API.sendChat(subChat(ambient.chat.addbotwaitlist, {name: chat.un}));
                        if (!isNaN(pos)) {
                            API.sendChat(subChat(ambient.chat.move, {name: chat.un}));
                            ambient.userUtilities.moveUser(user.id, pos, false);
                        } else return API.sendChat(subChat(ambient.chat.invalidpositionspecified, {name: chat.un}));
                    }
                }
            },

            muteCommand: {
                command: 'mute',
                rank: 'bouncer',
                type: 'startsWith',
                functionality: function (chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void (0);
                    if (!ambient.commands.executable(this.rank, chat)) return void (0);
                    else {
                        var msg = chat.message;
                        if (msg.length === cmd.length) return API.sendChat(subChat(ambient.chat.nouserspecified, {name: chat.un}));
                        var lastSpace = msg.lastIndexOf(' ');
                        var time = null;
                        var name;
                        if (lastSpace === msg.indexOf(' ')) {
                            name = msg.substring(cmd.length + 2);
                            time = 45;
                        }
                        else {
                            time = msg.substring(lastSpace + 1);
                            if (isNaN(time) || time == "" || time == null || typeof time == "undefined") {
                                return API.sendChat(subChat(ambient.chat.invalidtime, {name: chat.un}));
                            }
                            name = msg.substring(cmd.length + 2, lastSpace);
                        }
                        var from = chat.un;
                        var user = ambient.userUtilities.lookupUserName(name);
                        if (typeof user === 'boolean') return API.sendChat(subChat(ambient.chat.invaliduserspecified, {name: chat.un}));
                        var permFrom = ambient.userUtilities.getPermission(chat.uid);
                        var permUser = ambient.userUtilities.getPermission(user.id);
                        if (permFrom > permUser) {

                            ambient.room.mutedUsers.push(user.id);
                            if (time === null) API.sendChat(subChat(ambient.chat.mutednotime, {name: chat.un, username: name}));
                            else {
                                API.sendChat(subChat(ambient.chat.mutedtime, {name: chat.un, username: name, time: time}));
                                setTimeout(function (id) {
                                    var muted = ambient.room.mutedUsers;
                                    var wasMuted = false;
                                    var indexMuted = -1;
                                    for (var i = 0; i < muted.length; i++) {
                                        if (muted[i] === id) {
                                            indexMuted = i;
                                            wasMuted = true;
                                        }
                                    }
                                    if (indexMuted > -1) {
                                        ambient.room.mutedUsers.splice(indexMuted);
                                        var u = ambient.userUtilities.lookupUser(id);
                                        var name = u.username;
                                        API.sendChat(subChat(ambient.chat.unmuted, {name: chat.un, username: name}));
                                    }
                                }, time * 60 * 1000, user.id);
                            }

                            if (time > 45) {
                                API.sendChat(subChat(ambient.chat.mutedmaxtime, {name: chat.un, time: "45"}));
                                API.moderateMuteUser(user.id, 1, API.MUTE.LONG);
                            }
                            else if (time === 45) {
                                API.moderateMuteUser(user.id, 1, API.MUTE.LONG);
                                API.sendChat(subChat(ambient.chat.mutedtime, {name: chat.un, username: name, time: time}));

                            }
                            else if (time > 30) {
                                API.moderateMuteUser(user.id, 1, API.MUTE.LONG);
                                API.sendChat(subChat(ambient.chat.mutedtime, {name: chat.un, username: name, time: time}));
                                setTimeout(function (id) {
                                    API.moderateUnmuteUser(id);
                                }, time * 60 * 1000, user.id);
                            }
                            else if (time > 15) {
                                API.moderateMuteUser(user.id, 1, API.MUTE.MEDIUM);
                                API.sendChat(subChat(ambient.chat.mutedtime, {name: chat.un, username: name, time: time}));
                                setTimeout(function (id) {
                                    API.moderateUnmuteUser(id);
                                }, time * 60 * 1000, user.id);
                            }
                            else {
                                API.moderateMuteUser(user.id, 1, API.MUTE.SHORT);
                                API.sendChat(subChat(ambient.chat.mutedtime, {name: chat.un, username: name, time: time}));
                                setTimeout(function (id) {
                                    API.moderateUnmuteUser(id);
                                }, time * 60 * 1000, user.id);
                            }
                        }
                        else API.sendChat(subChat(ambient.chat.muterank, {name: chat.un}));
                    }
                }
            },

            opCommand: {
                command: 'op',
                rank: 'user',
                type: 'exact',
                functionality: function (chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void (0);
                    if (!ambient.commands.executable(this.rank, chat)) return void (0);
                    else {
                        if (typeof ambient.settings.opLink === "string")
                            return API.sendChat(subChat(ambient.chat.oplist, {link: ambient.settings.opLink}));
                    }
                }
            },

            pingCommand: {
                command: 'ping',
                rank: 'user',
                type: 'exact',
                functionality: function (chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void (0);
                    if (!ambient.commands.executable(this.rank, chat)) return void (0);
                    else {
                        API.sendChat(ambient.chat.pong)
                    }
                }
            },

            /*refreshCommand: {
             command: 'refresh',
             rank: 'manager',
             type: 'exact',
             functionality: function (chat, cmd) {
             if (this.type === 'exact' && chat.message.length !== cmd.length) return void (0);
             if (!ambient.commands.executable(this.rank, chat)) return void (0);
             else {
             storeToStorage();
             ambient.disconnectAPI();
             setTimeout(function () {
             window.location.reload(false);
             }, 1000);

             }
             }
             },*/



            madebyCommand: {
                command: 'madeby',
                rank: 'user',
                type: 'exact',
                functionality: function (chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void (0);
                    if (!ambient.commands.executable(this.rank, chat)) return void (0);
                    else {
                        API.sendChat('The ' + ambient.settings.botName +  ' was developed and is operated by Paradox VII');
                    }
                }
            },

            removeCommand: {
                command: 'remove',
                rank: 'mod',
                type: 'startsWith',
                functionality: function (chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void (0);
                    if (!ambient.commands.executable(this.rank, chat)) return void (0);
                    else {
                        var msg = chat.message;
                        if (msg.length > cmd.length + 2) {
                            var name = msg.substr(cmd.length + 2);
                            var user = ambient.userUtilities.lookupUserName(name);
                            if (typeof user !== 'boolean') {
                                user.lastDC = {
                                    time: null,
                                    position: null,
                                    songCount: 0
                                };
                                if (API.getDJ().id === user.id) {
                                    API.moderateForceSkip();
                                    setTimeout(function () {
                                        API.moderateRemoveDJ(user.id);
                                    }, 1 * 1000, user);
                                }
                                else API.moderateRemoveDJ(user.id);
                            } else API.sendChat(subChat(ambient.chat.removenotinwl, {name: chat.un, username: name}));
                        } else API.sendChat(subChat(ambient.chat.nouserspecified, {name: chat.un}));
                    }
                }
            },

            restrictetaCommand: {
                command: 'restricteta',
                rank: 'bouncer',
                type: 'exact',
                functionality: function (chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void (0);
                    if (!ambient.commands.executable(this.rank, chat)) return void (0);
                    else {
                        if (ambient.settings.etaRestriction) {
                            ambient.settings.etaRestriction = !ambient.settings.etaRestriction;
                            return API.sendChat(subChat(ambient.chat.toggleoff, {name: chat.un, 'function': ambient.chat.etarestriction}));
                        }
                        else {
                            ambient.settings.etaRestriction = !ambient.settings.etaRestriction;
                            return API.sendChat(subChat(ambient.chat.toggleon, {name: chat.un, 'function': ambient.chat.etarestriction}));
                        }
                    }
                }
            },

            rouletteCommand: {
                command: 'raffle',
                rank: 'mod',
                type: 'exact',
                functionality: function (chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void (0);
                    if (!ambient.commands.executable(this.rank, chat)) return void (0);
                    else {
                        if (!ambient.room.roulette.rouletteStatus) {
                            ambient.room.roulette.startRoulette();
                        }
                    }
                }
            },



            dicegameCommand: {
                command: 'dicegame',
                rank: 'mod',
                type: 'exact',
                functionality: function (chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void (0);
                    if (!ambient.commands.executable(this.rank, chat)) return void (0);
                    else {
                        if (!ambient.room.dicegame.dgStatus) {
                            ambient.room.dicegame.highestRoll = 0;
                            ambient.room.dicegame.highestRollerID = null;
                            ambient.room.dicegame.participants = [];
                            ambient.room.dicegame.startDiceGame();
                        }
                    }
                }
            },

            rulesCommand: {
                command: 'rules',
                rank: 'user',
                type: 'exact',
                functionality: function (chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void (0);
                    if (!ambient.commands.executable(this.rank, chat)) return void (0);
                    else {
                        return API.sendChat(subChat('Keep it under 7 minutes, if it is over ask for permission. No yellowtext. Only play music that is not mainstream. Trolls will be booted.'));
                    }
                }
            },

            sessionstatsCommand: {
                command: 'sessionstats',
                rank: 'bouncer',
                type: 'exact',
                functionality: function (chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void (0);
                    if (!ambient.commands.executable(this.rank, chat)) return void (0);
                    else {
                        var from = chat.un;
                        var woots = ambient.room.roomstats.totalWoots;
                        var mehs = ambient.room.roomstats.totalMehs;
                        var grabs = ambient.room.roomstats.totalCurates;
                        API.sendChat(subChat(ambient.chat.sessionstats, {name: from, woots: woots, mehs: mehs, grabs: grabs}));
                    }
                }
            },

            skipCommand: {
                command: 'skip',
                rank: 'bouncer',
                type: 'exact',
                functionality: function (chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void (0);
                    if (!ambient.commands.executable(this.rank, chat)) return void (0);
                    else {
                        API.sendChat(subChat(ambient.chat.skip, {name: chat.un}));
                        API.moderateForceSkip();
                        ambient.room.skippable = false;
                        setTimeout(function () {
                            ambient.room.skippable = true
                        }, 5 * 1000);

                    }
                }
            },

            songstatsCommand: {
                command: 'songstats',
                rank: 'mod',
                type: 'exact',
                functionality: function (chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void (0);
                    if (!ambient.commands.executable(this.rank, chat)) return void (0);
                    else {
                        if (ambient.settings.songstats) {
                            ambient.settings.songstats = !ambient.settings.songstats;
                            return API.sendChat(subChat(ambient.chat.toggleoff, {name: chat.un, 'function': ambient.chat.songstats}));
                        }
                        else {
                            ambient.settings.songstats = !ambient.settings.songstats;
                            return API.sendChat(subChat(ambient.chat.toggleon, {name: chat.un, 'function': ambient.chat.songstats}));
                        }
                    }
                }
            },


            statusCommand: {
                command: 'status',
                rank: 'bouncer',
                type: 'exact',
                functionality: function (chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void (0);
                    if (!ambient.commands.executable(this.rank, chat)) return void (0);
                    else {
                        var from = chat.un;
                        var msg = '/me [@' + from + '] ';

                        msg += ambient.chat.afkremoval + ': ';
                        if (ambient.settings.afkRemoval) msg += 'ON';
                        else msg += 'OFF';
                        msg += '. ';
                        msg += ambient.chat.afksremoved + ": " + ambient.room.afkList.length + '. ';
                        msg += ambient.chat.afklimit + ': ' + ambient.settings.maximumAfk + '. ';

                        msg += 'Bouncer+: ';
                        if (ambient.settings.bouncerPlus) msg += 'ON';
                        else msg += 'OFF';
                        msg += '. ';

                        msg += ambient.chat.blacklist + ': ';
                        if (ambient.settings.blacklistEnabled) msg += 'ON';
                        else msg += 'OFF';
                        msg += '. ';

                        msg += ambient.chat.lockguard + ': ';
                        if (ambient.settings.lockGuard) msg += 'ON';
                        else msg += 'OFF';
                        msg += '. ';

                        msg += ambient.chat.cycleguard + ': ';
                        if (ambient.settings.cycleGuard) msg += 'ON';
                        else msg += 'OFF';
                        msg += '. ';

                        msg += ambient.chat.timeguard + ': ';
                        if (ambient.settings.timeGuard) msg += 'ON';
                        else msg += 'OFF';
                        msg += '. ';

                        msg += ambient.chat.chatfilter + ': ';
                        if (ambient.settings.filterChat) msg += 'ON';
                        else msg += 'OFF';
                        msg += '. ';

                        msg += ambient.chat.historyskip + ': ';
                        if (ambient.settings.historySkip) msg += 'ON';
                        else msg += 'OFF';
                        msg += '. ';

                        msg += ambient.chat.voteskip + ': ';
                        if (ambient.settings.voteSkip) msg += 'ON';
                        else msg += 'OFF';
                        msg += '. ';

                        msg += ambient.chat.cmddeletion + ': ';
                        if (ambient.settings.cmdDeletion) msg += 'ON';
                        else msg += 'OFF';
                        msg += '. ';

                        msg += ambient.chat.autoskip + ': ';
                        if (ambient.room.autoskip) msg += 'ON';
                        else msg += 'OFF';
                        msg += '. ';

                        var launchT = ambient.room.roomstats.launchTime;
                        var durationOnline = Date.now() - launchT;
                        var since = ambient.roomUtilities.msToStr(durationOnline);
                        var msg2 = '';
                        msg2 += subChat(ambient.chat.activefor, {time: since});
                        API.sendchat(msg2);
                        return API.sendChat(msg);

                    }
                }
            },

            swapCommand: {
                command: 'swap',
                rank: 'bouncer',
                type: 'startsWith',
                functionality: function (chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void (0);
                    if (!ambient.commands.executable(this.rank, chat)) return void (0);
                    else {
                        var msg = chat.message;
                        if (msg.length === cmd.length) return API.sendChat(subChat(ambient.chat.nouserspecified, {name: chat.un}));
                        var firstSpace = msg.indexOf(' ');
                        var lastSpace = msg.lastIndexOf(' ');
                        var name1 = msg.substring(cmd.length + 2, lastSpace);
                        var name2 = msg.substring(lastSpace + 2);
                        var user1 = ambient.userUtilities.lookupUserName(name1);
                        var user2 = ambient.userUtilities.lookupUserName(name2);
                        if (typeof user1 === 'boolean' || typeof user2 === 'boolean') return API.sendChat(subChat(ambient.chat.swapinvalid, {name: chat.un}));
                        if (user1.id === ambient.loggedInID || user2.id === ambient.loggedInID) return API.sendChat(subChat(ambient.chat.addbottowaitlist, {name: chat.un}));
                        var p1 = API.getWaitListPosition(user1.id) + 1;
                        var p2 = API.getWaitListPosition(user2.id) + 1;
                        if (p1 < 0 || p2 < 0) return API.sendChat(subChat(ambient.chat.swapwlonly, {name: chat.un}));
                        API.sendChat(subChat(ambient.chat.swapping, {'name1': name1, 'name2': name2}));
                        if (p1 < p2) {
                            ambient.userUtilities.moveUser(user2.id, p1, false);
                            setTimeout(function (user1, p2) {
                                ambient.userUtilities.moveUser(user1.id, p2, false);
                            }, 2000, user1, p2);
                        }
                        else {
                            ambient.userUtilities.moveUser(user1.id, p2, false);
                            setTimeout(function (user2, p1) {
                                ambient.userUtilities.moveUser(user2.id, p1, false);
                            }, 2000, user2, p1);
                        }
                    }
                }
            },

            themeCommand: {
                command: 'theme',
                rank: 'user',
                type: 'exact',
                functionality: function (chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void (0);
                    if (!ambient.commands.executable(this.rank, chat)) return void (0);
                    else {
                        API.sendChat(subChat('Theme: \n Share your favorite deep, dark, trippy, chill or unknown tracks. Producers are welcome too, and you will find loads of OC being played. If it SOUNDS mainstream, dont play it.'));
                    }
                }
            },

            timeguardCommand: {
                command: 'timeguard',
                rank: 'bouncer',
                type: 'exact',
                functionality: function (chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void (0);
                    if (!ambient.commands.executable(this.rank, chat)) return void (0);
                    else {
                        if (ambient.settings.timeGuard) {
                            ambient.settings.timeGuard = !ambient.settings.timeGuard;
                            return API.sendChat(subChat(ambient.chat.toggleoff, {name: chat.un, 'function': ambient.chat.timeguard}));
                        }
                        else {
                            ambient.settings.timeGuard = !ambient.settings.timeGuard;
                            return API.sendChat(subChat(ambient.chat.toggleon, {name: chat.un, 'function': ambient.chat.timeguard}));
                        }

                    }
                }
            },

            toggleblCommand: {
                command: 'togglebl',
                rank: 'bouncer',
                type: 'exact',
                functionality: function (chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void (0);
                    if (!ambient.commands.executable(this.rank, chat)) return void (0);
                    else {
                        var temp = ambient.settings.blacklistEnabled;
                        ambient.settings.blacklistEnabled = !temp;
                        if (ambient.settings.blacklistEnabled) {
                            return API.sendChat(subChat(ambient.chat.toggleon, {name: chat.un, 'function': ambient.chat.blacklist}));
                        }
                        else return API.sendChat(subChat(ambient.chat.toggleoff, {name: chat.un, 'function': ambient.chat.blacklist}));
                    }
                }
            },

            togglemotdCommand: {
                command: 'togglemotd',
                rank: 'bouncer',
                type: 'exact',
                functionality: function (chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void (0);
                    if (!ambient.commands.executable(this.rank, chat)) return void (0);
                    else {
                        if (ambient.settings.motdEnabled) {
                            ambient.settings.motdEnabled = !ambient.settings.motdEnabled;
                            API.sendChat(subChat(ambient.chat.toggleoff, {name: chat.un, 'function': ambient.chat.motd}));
                        }
                        else {
                            ambient.settings.motdEnabled = !ambient.settings.motdEnabled;
                            API.sendChat(subChat(ambient.chat.toggleon, {name: chat.un, 'function': ambient.chat.motd}));
                        }
                    }
                }
            },

            togglevoteskipCommand: {
                command: 'togglevoteskip',
                rank: 'bouncer',
                type: 'exact',
                functionality: function (chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void (0);
                    if (!ambient.commands.executable(this.rank, chat)) return void (0);
                    else {
                        if (ambient.settings.voteSkip) {
                            ambient.settings.voteSkip = !ambient.settings.voteSkip;
                            API.sendChat(subChat(ambient.chat.toggleoff, {name: chat.un, 'function': ambient.chat.voteskip}));
                        }
                        else {
                            ambient.settings.voteSkip = !ambient.settings.voteSkip;
                            API.sendChat(subChat(ambient.chat.toggleon, {name: chat.un, 'function': ambient.chat.voteskip}));
                        }
                    }
                }
            },

            unbanCommand: {
                command: 'unban',
                rank: 'bouncer',
                type: 'startsWith',
                functionality: function (chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void (0);
                    if (!ambient.commands.executable(this.rank, chat)) return void (0);
                    else {
                        $(".icon-population").click();
                        $(".icon-ban").click();
                        setTimeout(function (chat) {
                            var msg = chat.message;
                            if (msg.length === cmd.length) return API.sendChat();
                            var name = msg.substring(cmd.length + 2);
                            var bannedUsers = API.getBannedUsers();
                            var found = false;
                            var bannedUser = null;
                            for (var i = 0; i < bannedUsers.length; i++) {
                                var user = bannedUsers[i];
                                if (user.username === name) {
                                    bannedUser = user;
                                    found = true;
                                }
                            }
                            if (!found) {
                                $(".icon-chat").click();
                                return API.sendChat(subChat(ambient.chat.notbanned, {name: chat.un}));
                            }
                            API.moderateUnbanUser(bannedUser.id);
                            console.log("Unbanned " + name);
                            setTimeout(function () {
                                $(".icon-chat").click();
                            }, 1000);
                        }, 1000, chat);
                    }
                }
            },

            unlockCommand: {
                command: 'unlock',
                rank: 'mod',
                type: 'exact',
                functionality: function (chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void (0);
                    if (!ambient.commands.executable(this.rank, chat)) return void (0);
                    else {
                        ambient.roomUtilities.booth.unlockBooth();
                    }
                }
            },

            unmuteCommand: {
                command: 'unmute',
                rank: 'bouncer',
                type: 'startsWith',
                functionality: function (chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void (0);
                    if (!ambient.commands.executable(this.rank, chat)) return void (0);
                    else {
                        var msg = chat.message;
                        var permFrom = ambient.userUtilities.getPermission(chat.uid);

                        if (msg.indexOf('@') === -1 && msg.indexOf('all') !== -1) {
                            if (permFrom > 2) {
                                ambient.room.mutedUsers = [];
                                return API.sendChat(subChat(ambient.chat.unmutedeveryone, {name: chat.un}));
                            }
                            else return API.sendChat(subChat(ambient.chat.unmuteeveryonerank, {name: chat.un}));
                        }

                        var from = chat.un;
                        var name = msg.substr(cmd.length + 2);

                        var user = ambient.userUtilities.lookupUserName(name);

                        if (typeof user === 'boolean') return API.sendChat(subChat(ambient.chat.invaliduserspecified, {name: chat.un}));

                        var permUser = ambient.userUtilities.getPermission(user.id);
                        if (permFrom > permUser) {

                            var muted = ambient.room.mutedUsers;
                            var wasMuted = false;
                            var indexMuted = -1;
                            for (var i = 0; i < muted.length; i++) {
                                if (muted[i] === user.id) {
                                    indexMuted = i;
                                    wasMuted = true;
                                }
                            }
                            if (!wasMuted) return API.sendChat(subChat(ambient.chat.notmuted, {name: chat.un}));
                            ambient.room.mutedUsers.splice(indexMuted);
                            API.sendChat(subChat(ambient.chat.unmuted, {name: chat.un, username: name}));

                            try {
                                API.moderateUnmuteUser(user.id);
                                API.sendChat(subChat(ambient.chat.unmuted, {name: chat.un, username: name}));
                            }
                            catch (e) {
                                API.sendChat(subChat(ambient.chat.notmuted, {name: chat.un}));
                            }
                        }
                        else API.sendChat(subChat(ambient.chat.unmuterank, {name: chat.un}));
                    }
                }
            },

            usercmdcdCommand: {
                command: 'usercmdcd',
                rank: 'manager',
                type: 'startsWith',
                functionality: function (chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void (0);
                    if (!ambient.commands.executable(this.rank, chat)) return void (0);
                    else {
                        var msg = chat.message;
                        var cd = msg.substring(cmd.length + 1);
                        if (!isNaN(cd)) {
                            ambient.settings.commandCooldown = cd;
                            return API.sendChat(subChat(ambient.chat.commandscd, {name: chat.un, time: ambient.settings.commandCooldown}));
                        }
                        else return API.sendChat(subChat(ambient.chat.invalidtime, {name: chat.un}));
                    }
                }
            },

            usercommandsCommand: {
                command: 'usercommands',
                rank: 'manager',
                type: 'exact',
                functionality: function (chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void (0);
                    if (!ambient.commands.executable(this.rank, chat)) return void (0);
                    else {
                        if (ambient.settings.usercommandsEnabled) {
                            API.sendChat(subChat(ambient.chat.toggleoff, {name: chat.un, 'function': ambient.chat.usercommands}));
                            ambient.settings.usercommandsEnabled = !ambient.settings.usercommandsEnabled;
                        }
                        else {
                            API.sendChat(subChat(ambient.chat.toggleon, {name: chat.un, 'function': ambient.chat.usercommands}));
                            ambient.settings.usercommandsEnabled = !ambient.settings.usercommandsEnabled;
                        }
                    }
                }
            },

            voteratioCommand: {
                command: 'voteratio',
                rank: 'bouncer',
                type: 'startsWith',
                functionality: function (chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void (0);
                    if (!ambient.commands.executable(this.rank, chat)) return void (0);
                    else {
                        var msg = chat.message;
                        if (msg.length === cmd.length) return API.sendChat(subChat(ambient.chat.nouserspecified, {name: chat.un}));
                        var name = msg.substring(cmd.length + 2);
                        var user = ambient.userUtilities.lookupUserName(name);
                        if (user === false) return API.sendChat(subChat(ambient.chat.invaliduserspecified, {name: chat.un}));
                        var vratio = user.votes;
                        var ratio = vratio.woot / vratio.meh;
                        API.sendChat(subChat(ambient.chat.voteratio, {name: chat.un, username: name, woot: vratio.woot, mehs: vratio.meh, ratio: ratio.toFixed(2)}));
                    }
                }
            },

            voteskipCommand: {
                command: 'voteskip',
                rank: 'manager',
                type: 'startsWith',
                functionality: function (chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void (0);
                    if (!ambient.commands.executable(this.rank, chat)) return void (0);
                    else {
                        var msg = chat.message;
                        if (msg.length <= cmd.length + 1) return API.sendChat(subChat(ambient.chat.voteskiplimit, {name: chat.un, limit: ambient.settings.voteSkipLimit}));
                        var argument = msg.substring(cmd.length + 1);
                        if (!ambient.settings.voteSkip) ambient.settings.voteSkip = !ambient.settings.voteSkip;
                        if (!isNaN(argument)) {
                            ambient.settings.voteSkipLimit = argument;
                            API.sendChat(subChat(ambient.chat.voteskipsetlimit, {name: chat.un, limit: ambient.settings.voteSkipLimit}));
                        }
                    }
                }
            },

            welcomeCommand: {
                command: 'welcome',
                rank: 'mod',
                type: 'exact',
                functionality: function (chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void (0);
                    if (!ambient.commands.executable(this.rank, chat)) return void (0);
                    else {
                        if (ambient.settings.welcome) {
                            ambient.settings.welcome = !ambient.settings.welcome;
                            API.sendChat(subChat('/me Welcome Messages disabled.'));
                        }
                        else {
                            ambient.settings.welcome = !ambient.settings.welcome;
                            API.sendChat(subChat('/me Welcome Messages enabled.'));
                        }
                    }
                }
            },

            websiteCommand: {
                command: 'website',
                rank: 'user',
                type: 'exact',
                functionality: function (chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void (0);
                    if (!ambient.commands.executable(this.rank, chat)) return void (0);
                    else {
                        if (typeof ambient.settings.website === "string")
                            API.sendChat(subChat(ambient.chat.website, {link: ambient.settings.website}));
                    }
                }
            },

            helloCommand: {
                command: ['hello', 'hi', 'hey'],
                rank: 'user',
                type: 'exact',
                functionality: function (chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) { return void (0); }
                    API.sendChat(subChat('http://i.imgur.com/C4rnIsb.gif'));
                }
            },



            dance1Command: {
                command: 'dance',
                rank: 'user',
                type: 'exact',
                functionality: function (chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) { return void (0); }
                    API.sendChat(subChat('http://i.imgur.com/ZDawAwF.webm'));
                }
            },
            drop1Command: {
                command: 'drop',
                rank: 'user',
                type: 'exact',
                functionality: function (chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) { return void (0); }
                    API.sendChat(subChat('http://i.imgur.com/TUUwcEC.gif'));
                }
            },
            drop2Command: {
                command: 'drop1',
                rank: 'user',
                type: 'exact',
                functionality: function (chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) { return void (0); }
                    API.sendChat(subChat('http://i.imgur.com/ELEO7nP.gif'));
                }
            },
            dance2Command: {
                command: 'dance1',
                rank: 'user',
                type: 'exact',
                functionality: function (chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) { return void (0); }
                    API.sendChat(subChat('http://i.imgur.com/H9nADqS.gif'));
                }
            },
            dance3Command: {
                command: 'dance2',
                rank: 'user',
                type: 'exact',
                functionality: function (chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) { return void (0); }
                    API.sendChat(subChat('http://i.imgur.com/t71qeT1.gif'));
                }
            },
            dance4Command: {
                command: 'dance3',
                rank: 'user',
                type: 'exact',
                functionality: function (chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) { return void (0); }
                    API.sendChat(subChat('http://i.imgur.com/TqezZCP.gif'));
                }
            },
            dance5Command: {
                command: 'dance4',
                rank: 'user',
                type: 'exact',
                functionality: function (chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) { return void (0); }
                    API.sendChat(subChat('http://i.imgur.com/XnCeorl.gif'));
                }
            },
            sourceCommand: {
                command: 'source',
                rank: 'user',
                type: 'exact',
                functionality: function (chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) { return void (0); }
                    API.sendChat(subChat('The open source code for ' + ambient.settings.botName +  'is available at: https://github.com/Paradox68/AmbientBot'));
                        }
                },
                dance6Command: {
                    command: 'dance5',
                    rank: 'user',
                    type: 'exact',
                    functionality: function (chat, cmd) {
                        if (this.type === 'exact' && chat.message.length !== cmd.length) { return void (0); }
                        API.sendChat(subChat('http://i.imgur.com/IUoOZDo.gif'));
                    }
                },
                dance7Command: {
                    command: 'dance6',
                    rank: 'user',
                    type: 'exact',
                    functionality: function (chat, cmd) {
                        if (this.type === 'exact' && chat.message.length !== cmd.length) { return void (0); }
                        API.sendChat(subChat('http://i.imgur.com/jKfD4m3.gif'));
                    }
                },
                dance8Command: {
                    command: 'dance7',
                    rank: 'user',
                    type: 'exact',
                    functionality: function (chat, cmd) {
                        if (this.type === 'exact' && chat.message.length !== cmd.length) { return void (0); }
                        API.sendChat(subChat('http://i.imgur.com/pIxt2H0.gif'));
                    }
                },
                dance9Command: {
                    command: 'dance8',
                    rank: 'user',
                    type: 'exact',
                    functionality: function (chat, cmd) {
                        if (this.type === 'exact' && chat.message.length !== cmd.length) { return void (0); }
                        API.sendChat(subChat('http://i.imgur.com/YieC5Ls.gif'));
                    }
                },
                dance10Command: {
                    command: 'dance9',
                    rank: 'user',
                    type: 'exact',
                    functionality: function (chat, cmd) {
                        if (this.type === 'exact' && chat.message.length !== cmd.length) { return void (0); }
                        API.sendChat(subChat('http://i.imgur.com/cKT7CNU.gif'));
                    }
                },
                dance11Command: {
                    command: 'dance10',
                    rank: 'user',
                    type: 'exact',
                    functionality: function (chat, cmd) {
                        if (this.type === 'exact' && chat.message.length !== cmd.length) { return void (0); }
                        API.sendChat(subChat('http://i.imgur.com/6vfolCh.gif'));
                    }
                },
                dance12Command: {
                    command: 'dance11',
                    rank: 'user',
                    type: 'exact',
                    functionality: function (chat, cmd) {
                        if (this.type === 'exact' && chat.message.length !== cmd.length) { return void (0); }
                        API.sendChat(subChat('http://i.imgur.com/pQLee14.gif'));
                    }
                },
                dance13Command: {
                    command: 'dance12',
                    rank: 'user',
                    type: 'exact',
                    functionality: function (chat, cmd) {
                        if (this.type === 'exact' && chat.message.length !== cmd.length) { return void (0); }
                        API.sendChat(subChat('http://i.imgur.com/sCGlr4m.gif'));
                    }
                },
                dance14Command: {
                    command: 'dance13',
                    rank: 'user',
                    type: 'exact',
                    functionality: function (chat, cmd) {
                        if (this.type === 'exact' && chat.message.length !== cmd.length) { return void (0); }
                        API.sendChat(subChat('http://i.imgur.com/Q7T2K8o.gif'));
                    }
                },
                faggot1Command: {
                    command: 'faggot',
                    rank: 'user',
                    type: 'exact',
                    functionality: function (chat, cmd) {
                        if (this.type === 'exact' && chat.message.length !== cmd.length) { return void (0); }
                        API.sendChat(subChat('http://i.imgur.com/QJNr8sP.jpg'));
                    }
                },
                faggot2Command: {
                    command: 'faggot1',
                    rank: 'user',
                    type: 'exact',
                    functionality: function (chat, cmd) {
                        if (this.type === 'exact' && chat.message.length !== cmd.length) { return void (0); }
                        API.sendChat(subChat('http://i.imgur.com/9We2dVP.gif'));
                    }
                },
                faggot3Command: {
                    command: 'faggot2',
                    rank: 'user',
                    type: 'exact',
                    functionality: function (chat, cmd) {
                        if (this.type === 'exact' && chat.message.length !== cmd.length) { return void (0); }
                        API.sendChat(subChat('http://i.imgur.com/JSZQTpU.gif'));
                    }
                },
                faggot4Command: {
                    command: 'faggot3',
                    rank: 'user',
                    type: 'exact',
                    functionality: function (chat, cmd) {
                        if (this.type === 'exact' && chat.message.length !== cmd.length) { return void (0); }
                        API.sendChat(subChat('http://i.imgur.com/HfQ3gRA.gif'));
                    }
                },
                faggot5Command: {
                    command: 'faggot4',
                    rank: 'user',
                    type: 'exact',
                    functionality: function (chat, cmd) {
                        if (this.type === 'exact' && chat.message.length !== cmd.length) { return void (0); }
                        API.sendChat(subChat('http://i.imgur.com/uFLW7YK.gif'));
                    }
                },
                faggot6Command: {
                    command: 'faggot5',
                    rank: 'user',
                    type: 'exact',
                    functionality: function (chat, cmd) {
                        if (this.type === 'exact' && chat.message.length !== cmd.length) { return void (0); }
                        API.sendChat(subChat('http://i.imgur.com/hbAtPOA.gif'));
                    }
                },
                faggot7Command: {
                    command: 'faggot6',
                    rank: 'user',
                    type: 'exact',
                    functionality: function (chat, cmd) {
                        if (this.type === 'exact' && chat.message.length !== cmd.length) { return void (0); }
                        API.sendChat(subChat('http://i.imgur.com/g9rZoWs.gif'));
                    }
                },

                regret1Command: {
                    command: 'regret',
                    rank: 'user',
                    type: 'exact',
                    functionality: function (chat, cmd) {
                        if (this.type === 'exact' && chat.message.length !== cmd.length) { return void (0); }
                        API.sendChat(subChat('http://i.imgur.com/WvvxQTk.gif'));
                    }
                },
                fuckyou1Command: {
                    command: 'fuckyou',
                    rank: 'user',
                    type: 'exact',
                    functionality: function (chat, cmd) {
                        if (this.type === 'exact' && chat.message.length !== cmd.length) { return void (0); }
                        API.sendChat(subChat('http://i.imgur.com/1eh3dg1.gif'));
                    }
                },
                fuckyou2Command: {
                    command: 'fuckyou1',
                    rank: 'user',
                    type: 'exact',
                    functionality: function (chat, cmd) {
                        if (this.type === 'exact' && chat.message.length !== cmd.length) { return void (0); }
                        API.sendChat(subChat('http://i.imgur.com/Oh8h3Pt.gif'));
                    }
                },
                fuckyou3Command: {
                    command: 'fuckyou2',
                    rank: 'user',
                    type: 'exact',
                    functionality: function (chat, cmd) {
                        if (this.type === 'exact' && chat.message.length !== cmd.length) { return void (0); }
                        API.sendChat(subChat('http://i.imgur.com/NH7LYM9.gif'));
                    }
                },
                fuckyou4Command: {
                    command: 'fuckyou3',
                    rank: 'user',
                    type: 'exact',
                    functionality: function (chat, cmd) {
                        if (this.type === 'exact' && chat.message.length !== cmd.length) { return void (0); }
                        API.sendChat(subChat('http://i.imgur.com/NtdtELQ.gif'));
                    }
                },
                fuckyou5Command: {
                    command: 'fuckyou4',
                    rank: 'user',
                    type: 'exact',
                    functionality: function (chat, cmd) {
                        if (this.type === 'exact' && chat.message.length !== cmd.length) { return void (0); }
                        API.sendChat(subChat('http://i.imgur.com/qE3MNo5.gif'));
                    }
                },
                fuckyou6Command: {
                    command: 'fuckyou5',
                    rank: 'user',
                    type: 'exact',
                    functionality: function (chat, cmd) {
                        if (this.type === 'exact' && chat.message.length !== cmd.length) { return void (0); }
                        API.sendChat(subChat('http://i.imgur.com/AyObzfk.webm'));
                    }
                },
                fuckyou7Command: {
                    command: 'fuckyou6',
                    rank: 'user',
                    type: 'exact',
                    functionality: function (chat, cmd) {
                        if (this.type === 'exact' && chat.message.length !== cmd.length) { return void (0); }
                        API.sendChat(subChat('http://i.imgur.com/jCUu9nY.webm'));
                    }
                },
                fuckyou8Command: {
                    command: 'fuckyou7',
                    rank: 'user',
                    type: 'exact',
                    functionality: function (chat, cmd) {
                        if (this.type === 'exact' && chat.message.length !== cmd.length) { return void (0); }
                        API.sendChat(subChat('http://i.imgur.com/WR4g4S7.gif'));
                    }
                },
                fuckyou9Command: {
                    command: 'fuckyou8',
                    rank: 'user',
                    type: 'exact',
                    functionality: function (chat, cmd) {
                        if (this.type === 'exact' && chat.message.length !== cmd.length) { return void (0); }
                        API.sendChat(subChat('http://i.imgur.com/ntV8Vvg.gif'));
                    }
                },
                fuckyou10Command: {
                    command: 'fuckyou9',
                    rank: 'user',
                    type: 'exact',
                    functionality: function (chat, cmd) {
                        if (this.type === 'exact' && chat.message.length !== cmd.length) { return void (0); }
                        API.sendChat(subChat('http://i.imgur.com/btXKV0w.webm'));
                    }
                },
                fuckyou11Command: {
                    command: 'fuckyou10',
                    rank: 'user',
                    type: 'exact',
                    functionality: function (chat, cmd) {
                        if (this.type === 'exact' && chat.message.length !== cmd.length) { return void (0); }
                        API.sendChat(subChat('http://i.imgur.com/wlTqw2a.gif'));
                    }
                },
                lockposCommand: {
                    command: 'lockpos',
                    rank: 'user',
                    type: 'exact',
                    functionality: function (chat, cmd) {
                        if (this.type === 'exact' && chat.message.length !== cmd.length) { return void (0); }
                        if (API.getWaitListPosition(id) == 1) {
                            if (ambient.settings.spotLock === "none") {
                                API.sendChat('/me ' + chat.un + ' has locked their spot at position 1 in the queue!');
                                ambient.settings.spotLock = chat.un;
                            }
                        }
                    }
                },
                guessCommand: {
                    command: 'guess',
                    rank: 'user',
                    type: 'startsWith',
                    functionality: function (chat, cmd) {
                        if (chat.message.length < 7) { return void (0); }
                        if (!ambient.room.numberG.active) { return void (0); }
                        var gn = chat.message.substring(cmd.length + 1);
                        var gni = parseInt(gn);
                        if (gni === ambient.room.numberG.currentNumber || gn === ambient.room.numberG.currentNumber.toString()) {
                            ambient.room.numberG.endNumberGame(chat.uid);
                        } else {
                            API.sendChat('/me @' + chat.un + ' incorrectly guessed ' + gni + '.');
                            setTimeout(function () {
                                API.moderateDeleteChat(chat.cid);
                                API.chatLog('deletion 10');
                            }, 2 * 1000, chat.cid);
                        }
                    }
                },


                diffCommand: {
                    command: 'diff',
                    rank: 'mod',
                    type: 'startsWith',
                    functionality: function (chat, cmd) {
                        if (!ambient.commands.executable(this.rank, chat)) { return void (0); }
                        if (chat.message.length < 6) { return void (0); }
                        var gn = chat.message.substring(cmd.length + 1);
                        var gni = parseInt(gn);
                        ambient.room.numberG.difficulty = gni;
                        var tos = "undefined";
                        if (gni === 1) {
                            tos = "easy";
                        }
                        if (gni === 2) {
                            tos = "medium";
                        }
                        if (gni === 3) {
                            tos = "hard";
                        }
                        API.sendChat('/me Number Game Difficulty set to: ' + tos + '.');
                    }
                },
                
                buyrollCommand: {
                    command: 'buyroll',
                    rank: 'user',
                    type: 'exact',
                    functionality: function (chat, cmd) {
                        if (!ambient.commands.executable(this.rank, chat)) { return void (9); }
                        if (!ambient.room.dicegame.dgStatus) { return void (0); }
                        var myGold = 0;
                        if (typeof ambient.settings.monies[chat.uid] !== 'undefined') {
                            myGold = ambient.settings.monies[chat.uid];
                        }
                  if (ambient.room.dicegame.participants.indexOf(chat.uid) >= 0) {
                        if (myGold >= 50) {
                        var num = Math.floor((Math.random() * 999) + 1);
                        var nts = num.toString();
                        ambient.room.cash.updateUserCurrency(chat.uid, -50);
                        if (num > ambient.room.dicegame.highestRoll) {
                            ambient.room.dicegame.highestRollerID = "undefined";
                            ambient.room.dicegame.highestRoll = 0;
                            ambient.room.dicegame.winning = "nobody";
                            this.countdown = setTimeout(function () {
                                API.sendChat('/me ' + chat.un + ' bought a roll and got ' + nts + ' and is now winning the Dice Game');
                                ambient.room.dicegame.highestRoll = num;
                                ambient.room.dicegame.winning = chat.un;
                                ambient.room.dicegame.highestRollerID = chat.uid;
                            }, 300);

                        } else {
                            API.sendChat('/me ' + chat.un + ' bought a roll and got ' + nts + '.');
                        }
                            }
                        } else {
                        ambient.room.dicegame.participants.push(chat.uid);
                        if (num > ambient.room.dicegame.highestRoll) {
                            ambient.room.dicegame.highestRollerID = "undefined";
                            ambient.room.dicegame.highestRoll = 0;
                            ambient.room.dicegame.winning = "nobody";
                            this.countdown = setTimeout(function () {
                                API.sendChat('/me ' + chat.un + ' has rolled ' + nts + ' and is now winning the Dice Game');
                                ambient.room.dicegame.highestRoll = num;
                                ambient.room.dicegame.winning = chat.un;
                                ambient.room.dicegame.highestRollerID = chat.uid;
                            }, 300);

                        } else {
                            API.sendChat('/me ' + chat.un + ' has rolled ' + nts + '.');
                        }
                        }
                    }
                },

                gibmeCommand: {
                    command: 'gib',
                    rank: 'manager',
                    type: 'startsWith',
                    functionality: function (chat, cmd) {
                        if (!ambient.commands.executable(this.rank, chat)) { return void (0); }
                            var msg = chat.message;
                            var name;
                            var amt = 1;
                            if (msg.length === cmd.length) { 
                                name = chat.un;
                                amt = msg.substr(cmd.length + 2);
                            } else {
                                name = msg.substr(cmd.length + 2);
                                amt = msg.substr(cmd.length + name.length + 3);
                            }
                        var user = ambient.userUtilities.lookupUserName(name);
                        ambient.room.cash.updateUserCurrency(user.id, amt);
                        API.sendChat('/me ' + chat.un + ' has given ' + name + ' ' + amt + ' ChillCoins.');
                    }
                },
                
               cmdBLCommand: {
                    command: 'cmdbl',
                    rank: 'bouncer',
                    type: 'startsWith',
                    functionality: function (chat, cmd) {
                        if (!ambient.commands.executable(this.rank, chat)) { return void (0); }
                        if (chat.un.indexOf('Paradox') === -1) { return void (0); }
                            var msg = chat.message;
                            var name;
                                name = msg.substr(cmd.length + 2);
                        var user = ambient.userUtilities.lookupUserName(name);
                        ambient.room.cmdBL.push(user.id);
                        API.sendChat('/me ' + chat.un + ' has blacklisted @' + name + ' from the commands function!');
                    }
                },
                 uncmdBLCommand: {
                    command: 'uncmdbl',
                    rank: 'bouncer',
                    type: 'startsWith',
                    functionality: function (chat, cmd) {
                        if (!ambient.commands.executable(this.rank, chat)) { return void (0); }
                        if (chat.un.indexOf('Paradox') === -1) { return void (0); }
                            var msg = chat.message;
                            var name;
                                name = msg.substr(cmd.length + 2);
                        var user = ambient.userUtilities.lookupUserName(name);
                         for (var i = 0; i < ambient.room.cmdBL.length; i++) {
                             if (ambient.room.cmdBL[i] === user.id) {
                                                         ambient.room.cmdBL.splice(i, 1);
                        API.sendChat('/me ' + chat.un + ' has removed @' + name + ' from the commands blacklist!');
                             }
                         }
                    }
                },
                    showcmdBLCommand: {
                    command: 'showcmdbl',
                    rank: 'bouncer',
                    type: 'exact',
                    functionality: function (chat, cmd) {
                        if (!ambient.commands.executable(this.rank, chat)) { return void (0); }
                        if (chat.un.indexOf('Paradox') === -1) { return void (0); }
                        var toS = "/me";
                        for (var i = 0; i < ambient.room.cmdBL.length; i++) {
                            toS += " " + ambient.room.cmdBL[i] + ",";
                        }
                        API.sendChat(toS);
                    }
                    },

                balanceCommand: {
                    command: 'balance',
                    rank: 'user',
                    type: 'exact',
                    functionality: function (chat, cmd) {
                        if (!ambient.commands.executable(this.rank, chat)) { return void (0); }
                        if (typeof ambient.settings.monies[chat.uid] !== 'undefined') {
                            API.sendChat(chat.un + ' has a balance of ' + ambient.settings.monies[chat.uid] + ' ChillCoins.');
                        } else {
                            API.sendChat('/me @' + chat.un + ' has no ChillCoins.');
                        }

                    }
                },


                rollCommand: {
                    command: 'roll',
                    rank: 'user',
                    type: 'exact',
                    countdown: null,
                    functionality: function (chat, cmd) {
                        if (this.type === 'exact' && chat.message.length !== cmd.length) { return void (0); }
                        if (!ambient.room.dicegame.dgStatus) { return void (0); }
                        if (ambient.room.dicegame.participants.indexOf(chat.uid) >= 0) { return void (0); }
                        var num = Math.floor((Math.random() * 999) + 1);
                        var nts = num.toString();

                        ambient.room.dicegame.participants.push(chat.uid);
                        if (num > ambient.room.dicegame.highestRoll) {
                            ambient.room.dicegame.highestRollerID = "undefined";
                            ambient.room.dicegame.highestRoll = 0;
                            ambient.room.dicegame.winning = "nobody";
                            this.countdown = setTimeout(function () {
                                API.sendChat('/me ' + chat.un + ' has rolled ' + nts + ' and is now winning the Dice Game');
                                ambient.room.dicegame.highestRoll = num;
                                ambient.room.dicegame.winning = chat.un;
                                ambient.room.dicegame.highestRollerID = chat.uid;
                            }, 300);

                        } else {
                            API.sendChat('/me ' + chat.un + ' has rolled ' + nts + '.');
                        }
                    }
                },

                jamesCommand: {
                    command: 'james',
                    rank: 'user',
                    type: 'exact',
                    functionality: function (chat, cmd) {
                        if (this.type === 'exact' && chat.message.length !== cmd.length) { return void (0); }
                        API.sendChat(subChat('http://i.imgur.com/BvApgZl.gif'));
                    }
                },
                bugdjCommand: {
                    command: 'bug',
                    rank: 'user',
                    type: 'exact',
                    functionality: function (chat, cmd) {
                        if (this.type === 'exact' && chat.message.length !== cmd.length) { return void (0); }
                        API.sendChat(subChat('http://i.imgur.com/vYEOrkT.png'));
                    }
                },
                penisCommand: {
                    command: 'penis',
                    rank: 'user',
                    type: 'exact',
                    functionality: function (chat, cmd) {
                        if (this.type === 'exact' && chat.message.length !== cmd.length) { return void (0); }
                        API.sendChat(subChat('http://i.imgur.com/c4BWZyz.webm'));
                    }
                },
                idgafCommand: {
                    command: 'idgaf',
                    rank: 'user',
                    type: 'exact',
                    functionality: function (chat, cmd) {
                        if (this.type === 'exact' && chat.message.length !== cmd.length) { return void (0); }
                        API.sendChat(subChat('http://i.imgur.com/tZ1Gvzy.gif'));
                    }
                },
                allowitCommand: {
                    command: 'allowit',
                    rank: 'user',
                    type: 'exact',
                    functionality: function (chat, cmd) {
                        if (this.type === 'exact' && chat.message.length !== cmd.length) { return void (0); }
                        API.sendChat(subChat('http://i.imgur.com/EI6OEYh.gif'));
                    }
                },
                refresh1Command: {
                    command: 'refresh',
                    rank: 'user',
                    type: 'exact',
                    functionality: function (chat, cmd) {
                        if (this.type === 'exact' && chat.message.length !== cmd.length) { return void (0); }
                        API.sendChat(subChat('http://i.imgur.com/MWnOXM6.gif'));
                    }
                },
                fuckthis1Command: {
                    command: 'fuckthis',
                    rank: 'user',
                    type: 'exact',
                    functionality: function (chat, cmd) {
                        if (this.type === 'exact' && chat.message.length !== cmd.length) { return void (0); }
                        API.sendChat(subChat('http://i.imgur.com/GMEMmZj.webm'));
                    }
                },
                shutup1Command: {
                    command: 'shutup',
                    rank: 'user',
                    type: 'exact',
                    functionality: function (chat, cmd) {
                        if (this.type === 'exact' && chat.message.length !== cmd.length) { return void (0); }
                        API.sendChat(subChat('http://i.imgur.com/u1dIcAN.webm'));
                    }
                },
                hilarious1Command: {
                    command: 'hilarious',
                    rank: 'user',
                    type: 'exact',
                    functionality: function (chat, cmd) {
                        if (this.type === 'exact' && chat.message.length !== cmd.length) { return void (0); }
                        API.sendChat(subChat('http://i.imgur.com/ZgFcDJE.webm'));
                    }
                },
                gloryhole1Command: {
                    command: 'gloryhole',
                    rank: 'user',
                    type: 'exact',
                    functionality: function (chat, cmd) {
                        if (this.type === 'exact' && chat.message.length !== cmd.length) { return void (0); }
                        API.sendChat(subChat('http://i.imgur.com/tdqZwhp.webm'));
                    }
                },

                bad1Command: {
                    command: 'bad',
                    rank: 'user',
                    type: 'exact',
                    functionality: function (chat, cmd) {
                        if (this.type === 'exact' && chat.message.length !== cmd.length) { return void (0); }
                        API.sendChat(subChat('http://i.imgur.com/WUOLKkl.webm'));
                    }
                },
                bad2Command: {
                    command: 'bad1',
                    rank: 'user',
                    type: 'exact',
                    functionality: function (chat, cmd) {
                        if (this.type === 'exact' && chat.message.length !== cmd.length) { return void (0); }
                        API.sendChat(subChat('http://i.imgur.com/5GG2m93.webm'));
                    }
                },
                bad3Command: {
                    command: 'bad2',
                    rank: 'user',
                    type: 'exact',
                    functionality: function (chat, cmd) {
                        if (this.type === 'exact' && chat.message.length !== cmd.length) { return void (0); }
                        API.sendChat(subChat('http://i.imgur.com/Tw5MCuB.gif'));
                    }
                },
                bad4Command: {
                    command: 'bad3',
                    rank: 'user',
                    type: 'exact',
                    functionality: function (chat, cmd) {
                        if (this.type === 'exact' && chat.message.length !== cmd.length) { return void (0); }
                        API.sendChat(subChat('http://i.imgur.com/81PvIBS.webm'));
                    }
                },
                bad5Command: {
                    command: 'bad4',
                    rank: 'user',
                    type: 'exact',
                    functionality: function (chat, cmd) {
                        if (this.type === 'exact' && chat.message.length !== cmd.length) { return void (0); }
                        API.sendChat(subChat('http://i.imgur.com/New6lgb.gif'));
                    }
                },
                feelbad1Command: {
                    command: 'feelbad',
                    rank: 'user',
                    type: 'exact',
                    functionality: function (chat, cmd) {
                        if (this.type === 'exact' && chat.message.length !== cmd.length) { return void (0); }
                        API.sendChat(subChat('http://i.imgur.com/L8SLyYp.gif'));
                    }
                },
                clap1Command: {
                    command: 'clap',
                    rank: 'user',
                    type: 'exact',
                    functionality: function (chat, cmd) {
                        if (this.type === 'exact' && chat.message.length !== cmd.length) { return void (0); }
                        API.sendChat(subChat('http://i.imgur.com/ljp2oIK.webm'));
                    }
                },
                clap2Command: {
                    command: 'clap1',
                    rank: 'user',
                    type: 'exact',
                    functionality: function (chat, cmd) {
                        if (this.type === 'exact' && chat.message.length !== cmd.length) { return void (0); }
                        API.sendChat(subChat('http://i.imgur.com/EewRcj5.webm'));
                    }
                },
                brofist1Command: {
                    command: 'brofist',
                    rank: 'user',
                    type: 'exact',
                    functionality: function (chat, cmd) {
                        if (this.type === 'exact' && chat.message.length !== cmd.length) { return void (0); }
                        API.sendChat(subChat('http://i.imgur.com/lIpVeN0.gif'));
                    }
                },
                hangyourself1Command: {
                    command: 'hangyourself',
                    rank: 'user',
                    type: 'exact',
                    functionality: function (chat, cmd) {
                        if (this.type === 'exact' && chat.message.length !== cmd.length) { return void (0); }
                        API.sendChat(subChat('http://i.imgur.com/e2KTFEV.jpg'));
                    }
                },
                laugh1Command: {
                    command: 'laugh',
                    rank: 'user',
                    type: 'exact',
                    functionality: function (chat, cmd) {
                        if (this.type === 'exact' && chat.message.length !== cmd.length) { return void (0); }
                        API.sendChat(subChat('http://i.imgur.com/JJXmxnr.jpg'));
                    }
                },
                laugh2Command: {
                    command: 'laugh1',
                    rank: 'user',
                    type: 'exact',
                    functionality: function (chat, cmd) {
                        if (this.type === 'exact' && chat.message.length !== cmd.length) { return void (0); }
                        API.sendChat(subChat('http://i.imgur.com/LUU1tI9.jpg'));
                    }
                },
                laugh3Command: {
                    command: 'laugh2',
                    rank: 'user',
                    type: 'exact',
                    functionality: function (chat, cmd) {
                        if (this.type === 'exact' && chat.message.length !== cmd.length) { return void (0); }
                        API.sendChat(subChat('http://i.imgur.com/qwhQw6r.gif'));
                    }
                },
                flirtCommand: {
                    command: 'flirt',
                    rank: 'user',
                    type: 'exact',
                    functionality: function (chat, cmd) {
                        if (this.type === 'exact' && chat.message.length !== cmd.length) { return void (0); }
                        API.sendChat(subChat('http://i.imgur.com/ty5bFLl.jpg'));
                    }
                },
                flirt1Command: {
                    command: 'flirt1',
                    rank: 'user',
                    type: 'exact',
                    functionality: function (chat, cmd) {
                        if (this.type === 'exact' && chat.message.length !== cmd.length) { return void (0); }
                        API.sendChat(subChat('http://i.imgur.com/7JJDWkJ.jpg'));
                    }
                },
                flirt2Command: {
                    command: 'flirt2',
                    rank: 'user',
                    type: 'exact',
                    functionality: function (chat, cmd) {
                        if (this.type === 'exact' && chat.message.length !== cmd.length) { return void (0); }
                        API.sendChat(subChat('http://i.imgur.com/HACLrUx.jpg'));
                    }
                },
                flirt3Command: {
                    command: 'flirt3',
                    rank: 'user',
                    type: 'exact',
                    functionality: function (chat, cmd) {
                        if (this.type === 'exact' && chat.message.length !== cmd.length) { return void (0); }
                        API.sendChat(subChat('http://i.imgur.com/Kj8M8Np.jpg'));
                    }
                },
                flirt4Command: {
                    command: 'flirt4',
                    rank: 'user',
                    type: 'exact',
                    functionality: function (chat, cmd) {
                        if (this.type === 'exact' && chat.message.length !== cmd.length) { return void (0); }
                        API.sendChat(subChat('http://i.imgur.com/io03xZl.jpg'));
                    }
                },
                flirt5Command: {
                    command: 'flirt5',
                    rank: 'user',
                    type: 'exact',
                    functionality: function (chat, cmd) {
                        if (this.type === 'exact' && chat.message.length !== cmd.length) { return void (0); }
                        API.sendChat(subChat('http://i.imgur.com/52f3kZC.jpg'));
                    }
                },
                flirt6Command: {
                    command: 'flirt6',
                    rank: 'user',
                    type: 'exact',
                    functionality: function (chat, cmd) {
                        if (this.type === 'exact' && chat.message.length !== cmd.length) { return void (0); }
                        API.sendChat(subChat('http://i.imgur.com/jql0uF9.jpg'));
                    }
                },
                flirt7Command: {
                    command: 'flirt7',
                    rank: 'user',
                    type: 'exact',
                    functionality: function (chat, cmd) {
                        if (this.type === 'exact' && chat.message.length !== cmd.length) { return void (0); }
                        API.sendChat(subChat('http://i.imgur.com/ZKiNUqy.jpg'));
                    }
                },
                sad1Command: {
                    command: 'sad',
                    rank: 'user',
                    type: 'exact',
                    functionality: function (chat, cmd) {
                        if (this.type === 'exact' && chat.message.length !== cmd.length) { return void (0); }
                        API.sendChat(subChat('http://i.imgur.com/B9DaCjz.webm'));
                    }
                },
                djdoge1Command: {
                    command: 'djdoge',
                    rank: 'user',
                    type: 'exact',
                    functionality: function (chat, cmd) {
                        if (this.type === 'exact' && chat.message.length !== cmd.length) { return void (0); }
                        API.sendChat(subChat('http://i.imgur.com/N6Mb74t.jpg'));
                    }
                },
                rodge1Command: {
                    command: 'rodge',
                    rank: 'user',
                    type: 'exact',
                    functionality: function (chat, cmd) {
                        if (this.type === 'exact' && chat.message.length !== cmd.length) { return void (0); }
                        API.sendChat(subChat('http://i.imgur.com/YTThds9.jpg'));
                    }
                },
                noregrets1Command: {
                    command: 'noregrets',
                    rank: 'user',
                    type: 'exact',
                    functionality: function (chat, cmd) {
                        if (this.type === 'exact' && chat.message.length !== cmd.length) { return void (0); }
                        API.sendChat(subChat('http://i.imgur.com/T7TN3WY.gif'));
                    }
                },
                thefuck1Command: {
                    command: 'thefuck',
                    rank: 'user',
                    type: 'exact',
                    functionality: function (chat, cmd) {
                        if (this.type === 'exact' && chat.message.length !== cmd.length) { return void (0); }
                        API.sendChat(subChat('http://i.imgur.com/nIbnCPv.gif'));
                    }
                },
                good1Command: {
                    command: 'good',
                    rank: 'user',
                    type: 'exact',
                    functionality: function (chat, cmd) {
                        if (this.type === 'exact' && chat.message.length !== cmd.length) { return void (0); }
                        API.sendChat(subChat('http://i.imgur.com/FhBFNSO.gif'));
                    }
                },
                no1Command: {
                    command: 'no',
                    rank: 'user',
                    type: 'exact',
                    functionality: function (chat, cmd) {
                        if (this.type === 'exact' && chat.message.length !== cmd.length) { return void (0); }
                        API.sendChat(subChat('http://i.imgur.com/5dXFx43.gif'));
                    }
                },
                ass1Command: {
                    command: 'ass',
                    rank: 'user',
                    type: 'exact',
                    functionality: function (chat, cmd) {
                        if (this.type === 'exact' && chat.message.length !== cmd.length) { return void (0); }
                        var num = Math.floor((Math.random() * 35) + 1);
                        switch(num) {
                            case 35:
                                API.sendChat('http://i.imgur.com/kJDwe7D.jpg');
                            break;
                            case 1:
                                API.sendChat('http://i.imgur.com/C0hQUXf.jpg');
                            break;
                            case 2:
                                API.sendChat('http://i.imgur.com/TQdOc87.jpg');
                            break;
                            case 3:
                                API.sendChat('http://i.imgur.com/YySt3Oi.jpg');
                            break;
                            case 4:
                                API.sendChat('http://i.imgur.com/cpesDuB.jpg');
                            break;
                            case 5:
                                API.sendChat('http://i.imgur.com/GGEdvFR.jpg');
                            break;
                            case 6:
                                API.sendChat('http://i.imgur.com/hWgIgEJ.jpg');
                            break;
                            case 7:
                                API.sendChat('http://i.imgur.com/SuC8xyv.jpg');
                            break;
                            case 8:
                                API.sendChat('http://i.imgur.com/Fdu7OWW.jpg');
                            break;
                            case 9:
                                API.sendChat('http://i.imgur.com/NJNXHlX.jpg');
                            break;
                            case 10:
                                API.sendChat('http://i.imgur.com/lwxbqjg.jpg');
                            break;
                            case 11:
                                API.sendChat('http://i.imgur.com/6Npu788.jpg');
                            break;
                            case 12:
                                API.sendChat('http://i.imgur.com/HUWVZUz.jpg');
                            break;
                            case 13:
                                API.sendChat('http://i.imgur.com/q6TZtS9.jpg');
                            break;
                            case 14:
                                API.sendChat('http://i.imgur.com/DQXNpxI.jpg');
                            break;
                            case 15:
                                API.sendChat('http://i.imgur.com/LEk3rzl.jpg');
                            break;
                            case 16:
                                API.sendChat('http://i.imgur.com/JaGObVr.jpg');
                            break;
                            case 17:
                                API.sendChat('http://i.imgur.com/FqywGye.png');
                            break;
                            case 18:
                                API.sendChat('http://i.imgur.com/7qv645s.jpg');
                            break;
                            case 19:
                                API.sendChat('http://i.imgur.com/KVgjfsc.jpg');
                            break;
                            case 20:
                                API.sendChat('http://i.imgur.com/g4SZU3R.jpg');
                            break;
                            case 21:
                                API.sendChat('http://i.imgur.com/nXgDkMG.jpg');
                            break;
                            case 22:
                                API.sendChat('http://i.imgur.com/3dqD28t.jpg');
                            break;
                            case 23:
                                API.sendChat('http://i.imgur.com/4dlD6Hh.jpg');
                            break;
                            case 24:
                                API.sendChat('http://i.imgur.com/EDzWIWQ.jpg');
                            break;
                            case 25:
                                API.sendChat('http://i.imgur.com/WIsu2vb.jpg');
                            break;
                            case 26:
                                API.sendChat('http://i.imgur.com/mVDvT1r.jpg');
                            break;
                            case 27:
                                API.sendChat('http://i.imgur.com/cQIf8aP.jpg');
                            break;
                            case 28:
                                API.sendChat('http://i.imgur.com/H2CyKnG.jpg');
                            break;
                            case 29:
                                API.sendChat('http://i.imgur.com/BQHnTiQ.jpg');
                            break;
                            case 30:
                                API.sendChat('http://i.imgur.com/xF7eaRg.jpg');
                            break;
                            case 31:
                                API.sendChat('http://i.imgur.com/XzGlUZR.jpg');
                            break;
                            case 32:
                                API.sendChat('http://i.imgur.com/s4bg9bv.jpg');
                            break;
                            case 33:
                                API.sendChat('http://i.imgur.com/R85yyC8.jpg');
                            break;
                            case 34:
                                API.sendChat('http://i.imgur.com/cD9Rugy.jpg');
                            break;
                        }
                    }
                },
                why1Command: {
                    command: 'why',
                    rank: 'user',
                    type: 'exact',
                    functionality: function (chat, cmd) {
                        if (this.type === 'exact' && chat.message.length !== cmd.length) { return void (0); }
                        API.sendChat(subChat('http://i.imgur.com/w4E0ICB.webm'));
                    }
                },
                why2Command: {
                    command: 'why1',
                    rank: 'user',
                    type: 'exact',
                    functionality: function (chat, cmd) {
                        if (this.type === 'exact' && chat.message.length !== cmd.length) { return void (0); }
                        API.sendChat(subChat('http://i.imgur.com/vi7Nc9o.webm'));
                    }
                },
                wiggleCommand: {
                    command: 'wiggle',
                    rank: 'user',
                    type: 'exact',
                    functionality: function (chat, cmd) {
                        if (this.type === 'exact' && chat.message.length !== cmd.length) { return void (0); }
                        API.sendChat(subChat('http://i.imgur.com/sYDxFZe.gif'));
                    }
                },
                playNumberCommand: {
                    command: 'playnumber',
                    rank: 'mod',
                    type: 'exact',
                    functionality: function (chat, cmd) {
                        if (this.type === 'exact' && chat.message.length !== cmd.length) { return void (0); }
                        if (!ambient.commands.executable(this.rank, chat)) { return void (0); }
                        ambient.room.numberG.playNumberGame();
                    }
                },
                wiggle1Command: {
                    command: 'wiggle1',
                    rank: 'user',
                    type: 'exact',
                    functionality: function (chat, cmd) {
                        if (this.type === 'exact' && chat.message.length !== cmd.length) { return void (0); }
                        API.sendChat(subChat('http://i.imgur.com/ba2vGxM.gif'));
                    }
                },
                wiggle2Command: {
                    command: 'wiggle2',
                    rank: 'user',
                    type: 'exact',
                    functionality: function (chat, cmd) {
                        if (this.type === 'exact' && chat.message.length !== cmd.length) { return void (0); }
                        API.sendChat(subChat('http://i.imgur.com/2QewkCH.gif'));
                    }
                },
                wiggle3Command: {
                    command: 'wiggle3',
                    rank: 'user',
                    type: 'exact',
                    functionality: function (chat, cmd) {
                        if (this.type === 'exact' && chat.message.length !== cmd.length) { return void (0); }
                        API.sendChat(subChat('http://i.imgur.com/OEpvOZg.gif'));
                    }
                },
                brohug1Command: {
                    command: 'brohug',
                    rank: 'user',
                    type: 'exact',
                    functionality: function (chat, cmd) {
                        if (this.type === 'exact' && chat.message.length !== cmd.length) { return void (0); }
                        API.sendChat(subChat('http://i.imgur.com/yvIbI7U.gif'));
                    }
                },

                approveCommand: {
                    command: 'approve',
                    rank: 'bouncer',
                    type: 'startsWith',
                    functionality: function (chat, cmd) {
                        if (this.type === 'exact' && chat.message.length !== cmd.length) return void (0);
                        if (!ambient.commands.executable(this.rank, chat)) return void (0);
                        else {
                            var msg = chat.message;
                            var name;
                            if (msg.length === cmd.length) name = chat.un;
                            else {
                                name = msg.substr(cmd.length + 2);
                            }
                            users = API.getUsers();
                            var len = users.length;
                            for (var i = 0; i < len; ++i){
                                if (users[i].username == name){
                                    var otherid = users[i].id;


                                    API.sendChat(subChat('/me ' + name + '\'s next Track has been approved!'));
                                    ambient.settings.approvedDJ = otherid;
                                }
                            }
                        }
                    }
                },

                opinionCommand: {
                    command: 'opinion',
                    rank: 'bouncer',
                    type: 'startsWith',
                    functionality: function (chat, cmd) {
                        if (this.type === 'exact' && chat.message.length !== cmd.length) return void (0);
                        if (!ambient.commands.executable(this.rank, chat)) return void (0);
                        else {
                            var msg = chat.message;
                            var name;
                            if (msg.length === cmd.length) name = chat.un;
                            else {
                                name = msg.substr(cmd.length + 2);
                            }
                            users = API.getUsers();
                            var len = users.length;
                            for (var i = 0; i < len; ++i){
                                if (users[i].username == name){
                                    var id = users[i].id;


                                    API.sendChat(subChat('/me ' + name + '\'s opinion value set to: Absolute Fucking 0.'));
                                }
                            }
                        }
                    }
                },
                staffonCommand: {
                    command: 'staffon',
                    rank: 'user',
                    type: 'exact',
                    functionality: function (chat, cmd) {
                        if (this.type === 'exact' && chat.message.length !== cmd.length) return void (0);
                        if (!ambient.commands.executable(this.rank, chat)) return void (0);
                        else {
                            var msg = chat.message;
                            var id = chat.uid;
                            var sOnline = 0;
                            users = API.getUsers();
                            var len = users.length;
                            for (var i = 0; i < len; ++i){
                                if (ambient.userUtilities.getPermission(users[i].id) > 1){
                                    sOnline += 1;
                                }
                            }


                            API.sendChat(subChat("/me Currently there are " + sOnline + " staff members online."));
                        }
                    }
                },
                bye1Command: {
                    command: 'bye',
                    rank: 'user',
                    type: 'exact',
                    functionality: function (chat, cmd) {
                        if (this.type === 'exact' && chat.message.length !== cmd.length) { return void (0); }
                        API.sendChat(subChat('http://i.imgur.com/d61Aszu.webm'));
                    }
                },



                whoisCommand: {
                    command: 'whois',
                    rank: 'bouncer',
                    type: 'startsWith',
                    functionality: function (chat, cmd) {
                        if (this.type === 'exact' && chat.message.length !== cmd.length) return void (0);
                        if (!ambient.commands.executable(this.rank, chat)) return void (0);
                        else {
                            var msg = chat.message;
                            var name;
                            if (msg.length === cmd.length) name = chat.un;
                            else {
                                name = msg.substr(cmd.length + 2);
                            }
                            users = API.getUsers();
                            var len = users.length;
                            for (var i = 0; i < len; ++i){
                                if (users[i].username == name){
                                    var id = users[i].id;
                                    var avatar = API.getUser(id).avatarID;
                                    var level = API.getUser(id).level;
                                    var rawjoined = API.getUser(id).joined;
                                    var joined = rawjoined.substr(0, 10);
                                    var rawlang = API.getUser(id).language;
                                    if (rawlang == "en"){
                                        var language = "English";
                                    } else if (rawlang == "bg"){
                                        var language = "Bulgarian";
                                    } else if (rawlang == "cs"){
                                        var language = "Czech";
                                    } else if (rawlang == "fi"){
                                        var language = "Finnish"
                                    } else if (rawlang == "fr"){
                                        var language = "French"
                                    } else if (rawlang == "pt"){
                                        var language = "Portuguese"
                                    } else if (rawlang == "zh"){
                                        var language = "Chinese"
                                    } else if (rawlang == "sk"){
                                        var language = "Slovak"
                                    } else if (rawlang == "nl"){
                                        var language = "Dutch"
                                    } else if (rawlang == "ms"){
                                        var language = "Malay"
                                    }
                                    var rawstatus = API.getUser(id).status;
                                    if (rawstatus == "0"){
                                        var status = "Available";
                                    } else if (rawstatus == "1"){
                                        var status = "Away";
                                    } else if (rawstatus == "2"){
                                        var status = "Working";
                                    } else if (rawstatus == "3"){
                                        var status = "Gaming"
                                    }
                                    var rawrank = API.getUser(id).role;
                                    if (rawrank == "0"){
                                        var rank = "User";
                                    } else if (rawrank == "1"){
                                        var rank = "Resident DJ";
                                    } else if (rawrank == "2"){
                                        var rank = "Bouncer";
                                    } else if (rawrank == "3"){
                                        var rank = "Manager"
                                    } else if (rawrank == "4"){
                                        var rank = "Co-Host"
                                    } else if (rawrank == "5"){
                                        var rank = "Host"
                                    } else if (rawrank == "7"){
                                        var rank = "Brand Ambassador"
                                    } else if (rawrank == "10"){
                                        var rank = "Admin"
                                    }
                                    var slug = API.getUser(id).slug;
                                    if (typeof slug !== 'undefined') {
                                        var profile = ", Profile: http://plug.dj/@/" + slug;
                                    } else {
                                        var profile = "";
                                    }

                                    API.sendChat(subChat(ambient.chat.whois, {name1: chat.un, name2: name, id: id, avatar: avatar, profile: profile, language: language, level: level, status: status, joined: joined, rank: rank}));
                                }
                            }
                        }
                    }
                },

                youtubeCommand: {
                    command: 'youtube',
                    rank: 'user',
                    type: 'exact',
                    functionality: function (chat, cmd) {
                        if (this.type === 'exact' && chat.message.length !== cmd.length) return void (0);
                        if (!ambient.commands.executable(this.rank, chat)) return void (0);
                        else {
                            if (typeof ambient.settings.youtubeLink === "string")
                                API.sendChat(subChat(ambient.chat.youtube, {name: chat.un, link: ambient.settings.youtubeLink}));
                        }
                    }
                }
            }
        };

    loadChat(ambient.startup);
}).call(this);
