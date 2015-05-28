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
        clearInterval(underground.room.autodisableInterval);
        clearInterval(underground.room.afkInterval);
        underground.status = false;
    };

    var storeToStorage = function () {
        localStorage.setItem("undergroundsettings", JSON.stringify(underground.settings));
        localStorage.setItem("undergroundRoom", JSON.stringify(underground.room));
        var undergroundStorageInfo = {
            time: Date.now(),
            stored: true,
            version: underground.version
        };
        localStorage.setItem("undergroundStorageInfo", JSON.stringify(undergroundStorageInfo));

    };

    var subChat = function (chat, obj) {
        if (typeof chat === "undefined") {
            API.chatLog("There is a chat text missing.");
            console.log("There is a chat text missing.");
            return "[Error] No text message found.";
        }
        var lit = '%%';
        for (var prop in obj) {
            chat = chat.replace(lit + prop.toUpperCase() + lit, obj[prop]);
        }
        return chat;
    };

    var loadChat = function (cb) {
        if (!cb) cb = function () {
        };

        $.get("https://rawgit.com/Paradox68/UndergroundBot/master/lang/langIndex.json", function (json) {
            var link = underground.chatLink;
            if (json !== null && typeof json !== "undefined") {
                langIndex = json;
                link = langIndex[underground.settings.language.toLowerCase()];
                if (underground.settings.chatLink !== underground.chatLink) {
                    link = underground.settings.chatLink;
                }
                else {
                    if (typeof link === "undefined") {
                        link = underground.chatLink;
                    }
                }
                $.get(link, function (json) {
                    if (json !== null && typeof json !== "undefined") {
                        if (typeof json === "string") json = JSON.parse(json);
                        underground.chat = json;
                        cb();
                    }
                });
            }
            else {
                $.get(underground.chatLink, function (json) {
                    if (json !== null && typeof json !== "undefined") {
                        if (typeof json === "string") json = JSON.parse(json);
                        underground.chat = json;
                        cb();
                    }
                });
            }
        });
    };

    var retrieveSettings = function () {
        var settings = JSON.parse(localStorage.getItem("undergroundsettings"));
        if (settings !== null) {
            for (var prop in settings) {
                underground.settings[prop] = settings[prop];
            }
        }
    };

    var retrieveFromStorage = function () {
        var info = localStorage.getItem("undergroundStorageInfo");
        if (info === null) API.chatLog(underground.chat.nodatafound);
        else {
            var settings = JSON.parse(localStorage.getItem("undergroundsettings"));
            var room = JSON.parse(localStorage.getItem("undergroundRoom"));
            var elapsed = Date.now() - JSON.parse(info).time;
            if ((elapsed < 1 * 60 * 60 * 1000)) {
                API.chatLog(underground.chat.retrievingdata);
                for (var prop in settings) {
                    underground.settings[prop] = settings[prop];
                }
                underground.room.users = room.users;
                underground.room.afkList = room.afkList;
                underground.room.historyList = room.historyList;
                underground.room.mutedUsers = room.mutedUsers;
                underground.room.autoskip = room.autoskip;
                underground.room.roomstats = room.roomstats;
                underground.room.messages = room.messages;
                underground.room.queue = room.queue;
                underground.room.newBlacklisted = room.newBlacklisted;
                underground.settings.monies = settings.monies;
                API.chatLog(underground.chat.datarestored);
            }
        }
        var json_sett = null;
        var roominfo = document.getElementById("room-settings");
        info = roominfo.textContent;
        var ref_bot = "@iScape Bot=";
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
                        underground.settings[prop] = json_sett[prop];
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
    var botMaintainer = "Underground Bot"
    var botCreatorIDs = ["3995934", "4105209"];

    var underground = {
        version: "1.7",
        status: false,
        name: "Underground Bot",
        loggedInID: null,
        scriptLink: "https://rawgit.com/Paradox68/UndergroundBot/master/iScape%20Bot.js",
        cmdLink: "http://git.io/245Ppg",
        chatLink: "https://rawgit.com/Paradox68/UndergroundBot/master/lang/en.json",
        chat: null,
        loadChat: loadChat,
        retrieveSettings: retrieveSettings,
        retrieveFromStorage: retrieveFromStorage,
        settings: {
            botName: "Underground Bot",
            monies: [" ", " "],
            language: "english",
            chatLink: "https://rawgit.com/Paradox68/UndergroundBot/master/lang/en.json",
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
            motd: "The Underground focuses on bringing you the best new music around. With a fun community and anti-pop culture music, it is easy to find your place here.",
            filterChat: true,
            etaRestriction: false,
            welcome: false,
            opLink: null,
            rulesLink: null,
            themeLink: null,
            fbLink: null,
            youtubeLink: null,
            website: "http://www.the-underground.info/",
            intervalMessages: [],
            messageInterval: 5,
            songstats: false,
            commandLiteral: "!",
            blacklists: {
                NSFW: "https://rawgit.com/Paradox68/UndergroundBot/master/nsfw.json",
                OP: "https://rawgit.com/Paradox68/UndergroundBot/master/op.json"
            }
        },
        room: {
            users: [],
            afkList: [],
            mutedUsers: [],
            bannedUsers: [],
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
                        toS = 'If a bot were capable of love, I would love you the most of all the pahetic flesh bags, @' + arguments[1] + '.';
                    }
                    if (arguments[0].indexOf('sex with') !== -1) {
                        toS = 'As a bot I do not follow your humanly laws of attraction.  So despite you being an ugly neckbearded faggot, yes I would. If I were programmed to, @' + arguments[1] + '.';
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
                    if($.isNumeric(underground.settings.monies[theuid]))
                        underground.settings.monies[theuid] += theamt;
                    else
                        underground.settings.monies[theuid] = theamt;
                    console.log(underground.settings.monies);
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
             underground.room.russiangame.RRStatus = true;
             underground.room.russiangame.chamber = Math.floor(Math.random() * 6 + 1);
             underground.room.russiangame.players = 0;
             underground.room.russiangame.gun = 0;
             underground.room.russiangame.countdown = setTimeout(function () {
             underground.room.russiangame.endRussianGame();
             }, 300 * 1000);
             underground.room.russiangame.guncd = setInterval(function () {
             underground.room.russiangame.shoot();
             }, 5 * 1000);
             API.sendChat('/me Russian Roulette is now active. Type !sit to claim your seat!');
             },
             endRussianGame: function () {
             if (underground.room.russiangame.RRStatus) {
             underground.room.russiangame.participants = [];
             underground.room.russiangame.RRStatus = false;
             underground.room.russiangame.players = 0;
             underground.room.russiangame.chamber = 0;
             API.sendChat('/me Russian Roulette seating was not filled and the game has timed out.');
             }
             },
             shoot: function () {
             if (underground.room.russiangame.RRStatus && underground.room.russiangame.players >= 6) {
             var ind = underground.room.roulette.participants[underground.room.russiangame.gun]);
             var next = underground.room.russiangame.participants[ind];
             underground.room.russiangame.started = true;
             underground.room.russiangame.gun++;
             API.sendChat('/me Testing russian roulette.. shot = ' + underground.room.russiangame.gun + ', chamber = ' + underground.room.russiangame.chamber + '.');
             if (ind == underground.room.chamber) {
             API.sendChat('ded call');
             clearInterval(underground.room.russiangame.guncd);
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
                    underground.room.numberG.active = true;
                    underground.room.numberG.countdown = setTimeout(function () {
                        underground.room.numberG.endNumberGameTime();
                    }, 90 * 1000);
                    if (underground.room.numberG.difficulty == 1) {
                        underground.room.numberG.currentNumber = Math.floor((Math.random() * 9) + 1);
                        underground.room.numberG.max = 10;
                    }
                    if (underground.room.numberG.difficulty == 2) {
                        underground.room.numberG.currentNumber = Math.floor((Math.random() * 24) + 1);
                        underground.room.numberG.max = 25;
                    }
                    if (underground.room.numberG.difficulty == 3) {
                        underground.room.numberG.currentNumber = Math.floor((Math.random() * 49) + 1);
                        underground.room.numberG.max = 50;
                    }
                    API.sendChat('/me I am thinking of a number between 1 and ' + underground.room.numberG.max + '. @everyone Type !guess # to guess what it is!');
                },
                endNumberGameTime: function() {
                    if (underground.room.numberG.active) {
                        underground.room.numberG.active = false;
                        underground.room.numberG.max = 0;
                        API.sendChat('/me Nobody has guessed the number I was thinking of correctly. :sleeping: Game over. The number was ' + underground.room.numberG.currentNumber + '.');
                        underground.room.numberG.currentNumber = 0;
                    }
                },
                endNumberGame: function(winnerID) {

                    var name = "undefined";
                    for (var i = 0; i < underground.room.users.length; i++) {
                        if (underground.room.users[i].id === winnerID) {
                            name = underground.room.users[i].username;

                            underground.room.numberG.active = false;
                            underground.room.numberG.max = 0;
                            API.sendChat('/me ' + name + ' has won the Number Game. The number was ' + underground.room.numberG.currentNumber + '.');
                            underground.room.numberG.currentNumber = 0;
                            setTimeout(function () {
                                if (API.getWaitListPosition(winnerID) > 3) {
                                    underground.userUtilities.moveUser(winnerID, 3, false);
                                } else {
                                    underground.userUtilities.moveUser(winnerID, 1, false);
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
                    underground.room.dicegame.dgStatus = true;
                    underground.room.dicegame.countdown = setTimeout(function () {
                        underground.room.dicegame.endDiceGame();
                    }, 60 * 1000);
                    API.sendChat('/me The Dice Game is now active. @everyone Type !roll and whoever rolls the highest will win! Use !buyroll to purchase an extra roll for 50 UGold.');
                },
                endDiceGame: function () {
                    underground.room.dicegame.dgStatus = false;
                    var winner = "undefined";
                    var ind = 0;
                    for (var i = 0; i < underground.room.users.length; i++) {
                        if (underground.room.users[i].id === underground.room.dicegame.highestRollerID) {
                            ind = i;

                            underground.room.dicegame.participants = [];
                            var pos = 1;
                            if (underground.settings.spotLock !== "none") {
                                pos = 2;
                            }
                            //var pos = Math.floor((Math.random() * API.getWaitList().length) + 1);
                            var name = underground.room.users[ind].username;
                            underground.settings.spotLock = "none";
                            API.sendChat('/me ' + name + ' has won the Dice Game with a ' + underground.room.dicegame.highestRoll + '. Moving to spot ' + pos + '.');
                            underground.room.dicegame.highestRoll = 0;
                            underground.room.dicegame.highestRollerID = "undefined";
                            setTimeout(function (winner, pos) {
                                underground.userUtilities.moveUser(underground.room.users[ind].id, pos, false);
                            }, 1 * 1000, underground.room.users[ind].id, pos);
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
                    underground.room.roulette.rouletteStatus = true;
                    underground.room.roulette.countdown = setTimeout(function () {
                        underground.room.roulette.endRoulette();
                    }, 60 * 1000);
                    API.sendChat('/me The Raffle is now open. @everyone Type !join to try your luck!');
                },
                endRoulette: function () {
                    underground.room.roulette.rouletteStatus = false;
                    var ind = Math.floor(Math.random() * underground.room.roulette.participants.length);
                    var winner = underground.room.roulette.participants[ind];
                    underground.room.roulette.participants = [];
                    var pos = 1;
                    if (underground.settings.spotLock !== "none") {
                        pos = 2;
                    }
                    //var pos = Math.floor((Math.random() * API.getWaitList().length) + 1);
                    var user = underground.userUtilities.lookupUser(winner);
                    var name = user.username;
                    underground.settings.spotLock = "none";
                    API.sendChat(subChat(underground.chat.winnerpicked, {name: name, position: pos}));
                    setTimeout(function (winner, pos) {
                        underground.userUtilities.moveUser(winner, pos, false);
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
                user.lastDC.songCount = underground.room.roomstats.songCount;
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
                for (var i = 0; i < underground.room.users.length; i++) {
                    if (underground.room.users[i].id === id) {
                        return underground.room.users[i];
                    }
                }
                return false;
            },
            lookupUserName: function (name) {
                for (var i = 0; i < underground.room.users.length; i++) {
                    var match = underground.room.users[i].username.trim() == name.trim();
                    if (match) {
                        return underground.room.users[i];
                    }
                }
                return false;
            },
            voteRatio: function (id) {
                var user = underground.userUtilities.lookupUser(id);
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
                var user = underground.userUtilities.lookupUser(id);
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
                        for (var i = 0; i < underground.room.queue.id.length; i++) {
                            if (underground.room.queue.id[i] === id) alreadyQueued = i;
                        }
                        if (alreadyQueued !== -1) {
                            underground.room.queue.position[alreadyQueued] = pos;
                            return API.sendChat(subChat(underground.chat.alreadyadding, {position: underground.room.queue.position[alreadyQueued]}));
                        }
                        underground.roomUtilities.booth.lockBooth();
                        if (priority) {
                            underground.room.queue.id.unshift(id);
                            underground.room.queue.position.unshift(pos);
                        }
                        else {
                            underground.room.queue.id.push(id);
                            underground.room.queue.position.push(pos);
                        }
                        var name = user.username;
                        return API.sendChat(subChat(underground.chat.adding, {name: name, position: underground.room.queue.position.length}));
                    }
                }
                else API.moderateMoveDJ(id, pos);
            },
            dclookup: function (id) {
                var user = underground.userUtilities.lookupUser(id);
                if (typeof user === 'boolean') return underground.chat.usernotfound;
                var name = user.username;
                if (user.lastDC.time === null) return subChat(underground.chat.notdisconnected, {name: name});
                var dc = user.lastDC.time;
                var pos = user.lastDC.position;
                if (pos === null) return underground.chat.noposition;
                var timeDc = Date.now() - dc;
                var validDC = false;
                if (underground.settings.maximumDc * 60 * 1000 > timeDc) {
                    validDC = true;
                }
                var time = underground.roomUtilities.msToStr(timeDc);
                if (!validDC) return (subChat(underground.chat.toolongago, {name: underground.userUtilities.getUser(user).username, time: time}));
                var songsPassed = underground.room.roomstats.songCount - user.lastDC.songCount;
                var afksRemoved = 0;
                var afkList = underground.room.afkList;
                for (var i = 0; i < afkList.length; i++) {
                    var timeAfk = afkList[i][1];
                    var posAfk = afkList[i][2];
                    if (dc < timeAfk && posAfk < pos) {
                        afksRemoved++;
                    }
                }
                var newPosition = user.lastDC.position - songsPassed - afksRemoved;
                if (newPosition <= 0) newPosition = 1;
                var msg = subChat(underground.chat.valid, {name: underground.userUtilities.getUser(user).username, time: time, position: newPosition});
                underground.userUtilities.moveUser(user.id, newPosition, true);
                return msg;
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
                    API.moderateLockWaitList(!underground.roomUtilities.booth.locked);
                    underground.roomUtilities.booth.locked = false;
                    if (underground.settings.lockGuard) {
                        underground.roomUtilities.booth.lockTimer = setTimeout(function () {
                            API.moderateLockWaitList(underground.roomUtilities.booth.locked);
                        }, underground.settings.maximumLocktime * 60 * 1000);
                    }
                },
                unlockBooth: function () {
                    API.moderateLockWaitList(underground.roomUtilities.booth.locked);
                    clearTimeout(underground.roomUtilities.booth.lockTimer);
                }
            },
            afkCheck: function () {
                if (!underground.status || !underground.settings.afkRemoval) return void (0);
                var rank = underground.roomUtilities.rankToNumber(underground.settings.afkRankCheck);
                var djlist = API.getWaitList();
                var lastPos = Math.min(djlist.length, underground.settings.afkpositionCheck);
                if (lastPos - 1 > djlist.length) return void (0);
                for (var i = 0; i < lastPos; i++) {
                    if (typeof djlist[i] !== 'undefined') {
                        var id = djlist[i].id;
                        var user = underground.userUtilities.lookupUser(id);
                        if (typeof user !== 'boolean') {
                            var plugUser = underground.userUtilities.getUser(user);
                            if (rank !== null && underground.userUtilities.getPermission(plugUser) <= rank) {
                                var name = plugUser.username;
                                var lastActive = underground.userUtilities.getLastActivity(user);
                                var inactivity = Date.now() - lastActive;
                                var time = underground.roomUtilities.msToStr(inactivity);
                                var warncount = user.afkWarningCount;
                                if (inactivity > underground.settings.maximumAfk * 60 * 1000) {
                                    if (warncount === 0) {
                                        API.sendChat(subChat(underground.chat.warning1, {name: name, time: time}));
                                        user.afkWarningCount = 3;
                                        user.afkCountdown = setTimeout(function (userToChange) {
                                            userToChange.afkWarningCount = 1;
                                        }, 90 * 1000, user);
                                    }
                                    else if (warncount === 1) {
                                        API.sendChat(subChat(underground.chat.warning2, {name: name}));
                                        user.afkWarningCount = 3;
                                        user.afkCountdown = setTimeout(function (userToChange) {
                                            userToChange.afkWarningCount = 2;
                                        }, 30 * 1000, user);
                                    }
                                    else if (warncount === 2) {
                                        var pos = API.getWaitListPosition(id);
                                        if (pos !== -1) {
                                            pos++;
                                            underground.room.afkList.push([id, Date.now(), pos]);
                                            user.lastDC = {

                                                time: null,
                                                position: null,
                                                songCount: 0
                                            };
                                            API.moderateRemoveDJ(id);
                                            API.sendChat(subChat(underground.chat.afkremove, {name: name, time: time, position: pos, maximumafk: underground.settings.maximumAfk}));
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
                    if (underground.settings.cycleGuard) {
                        underground.room.cycleTimer = setTimeout(function () {
                            if (toggle.hasClass("enabled")) toggle.click();
                        }, underground.settings.cycleMaxTime * 60 * 1000);
                    }
                }
                else {
                    toggle.click();
                    clearTimeout(underground.room.cycleTimer);
                }
            },
            intervalMessage: function () {
                var interval;
                if (underground.settings.motdEnabled) interval = underground.settings.motdInterval;
                else interval = underground.settings.messageInterval;
                if ((underground.room.roomstats.songCount % interval) === 0 && underground.status) {
                    var msg;
                    if (underground.settings.motdEnabled) {
                        msg = underground.settings.motd;
                    }
                    else {
                        if (underground.settings.intervalMessages.length === 0) return void (0);
                        var messageNumber = underground.room.roomstats.songCount % underground.settings.intervalMessages.length;
                        msg = underground.settings.intervalMessages[messageNumber];
                    }
                    API.sendChat('/me ' + msg);
                }
            },
            updateBlacklists: function () {
                for (var bl in underground.settings.blacklists) {
                    underground.room.blacklists[bl] = [];
                    if (typeof underground.settings.blacklists[bl] === 'function') {
                        underground.room.blacklists[bl] = underground.settings.blacklists();
                    }
                    else if (typeof underground.settings.blacklists[bl] === 'string') {
                        if (underground.settings.blacklists[bl] === '') {
                            continue;
                        }
                        try {
                            (function (l) {
                                $.get(underground.settings.blacklists[l], function (data) {
                                    if (typeof data === 'string') {
                                        data = JSON.parse(data);
                                    }
                                    var list = [];
                                    for (var prop in data) {
                                        if (typeof data[prop].mid !== 'undefined') {
                                            list.push(data[prop].mid);
                                        }
                                    }
                                    underground.room.blacklists[l] = list;
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
                    console.table(underground.room.newBlacklisted);
                }
                else {
                    console.log(underground.room.newBlacklisted);
                }
            },
            exportNewBlacklistedSongs: function () {
                var list = {};
                for (var i = 0; i < underground.room.newBlacklisted.length; i++) {
                    var track = underground.room.newBlacklisted[i];
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
            for (var i = 0; i < underground.room.users.length; i++) {
                if (underground.room.users[i].id === chat.uid) {
                    underground.userUtilities.setLastActivity(underground.room.users[i]);
                    if (underground.room.users[i].username !== chat.un) {
                        underground.room.users[i].username = chat.un;
                    }
                }
            }
            if (chat.message.indexOf(underground.settings.botName) !== -1) {
                underground.room.response.getResponse(chat.message.toLowerCase(), chat.un);
            }
            if (underground.chatUtilities.chatFilter(chat)) return void (0);
            if (!underground.chatUtilities.commandCheck(chat))
                underground.chatUtilities.action(chat);
        },
        eventUserjoin: function (user) {
            var known = false;
            var index = null;
            for (var i = 0; i < underground.room.users.length; i++) {
                if (underground.room.users[i].id === user.id) {
                    known = true;
                    index = i;
                }
            }
            var greet = true;
            var welcomeback = null;
            if (known) {
                underground.room.users[index].inRoom = true;
                var u = underground.userUtilities.lookupUser(user.id);
                var jt = u.jointime;
                var t = Date.now() - jt;
                if (t < 10 * 1000) greet = false;
                else welcomeback = true;
            }
            else {
                underground.room.users.push(new underground.User(user.id, user.username));
                welcomeback = false;
            }
            for (var j = 0; j < underground.room.users.length; j++) {
                if (underground.userUtilities.getUser(underground.room.users[j]).id === user.id) {
                    underground.userUtilities.setLastActivity(underground.room.users[j]);
                    underground.room.users[j].jointime = Date.now();
                }

            }
            if (underground.settings.welcome && greet) {
                welcomeback ?
                    setTimeout(function (user) {
                        API.sendChat(subChat('/me Welcome back to The Underground, @' + user.username + '.'));
                    }, 1 * 1000, user)
                    :
                    setTimeout(function (user) {
                        API.sendChat(subChat('/me Welcome to The Underground, @' + user.username + '. Enjoy your stay.'));
                    }, 1 * 1000, user);
            }
        },
        eventUserleave: function (user) {
            for (var i = 0; i < underground.room.users.length; i++) {
                if (underground.room.users[i].id === user.id) {
                    underground.userUtilities.updateDC(underground.room.users[i]);
                    underground.room.users[i].inRoom = false;
                }
            }
        },
        eventVoteupdate: function (obj) {
            for (var i = 0; i < underground.room.users.length; i++) {
                if (underground.room.users[i].id === obj.user.id) {
                    if (obj.vote === 1) {
                        underground.room.users[i].votes.woot++;
                        underground.room.cash.updateUserCurrency(obj.dj.id, 1);
                    }
                    else {
                        underground.room.users[i].votes.meh++;
                    }
                }
            }

            var mehs = API.getScore().negative;
            var woots = API.getScore().positive;
            var dj = API.getDJ();

            if (underground.settings.voteSkip) {
                if ((mehs - woots) >= (underground.settings.voteSkipLimit)) {
                    API.sendChat(subChat(underground.chat.voteskipexceededlimit, {name: dj.username, limit: underground.settings.voteSkipLimit}));
                    API.moderateForceSkip();
                }
            }

        },
        eventCurateupdate: function (obj) {
            for (var i = 0; i < underground.room.users.length; i++) {
                if (underground.room.users[i].id === obj.user.id) {
                    underground.room.users[i].votes.curate++;
                }
            }
        },
        eventDjadvance: function (obj) {
            $("#woot").click(); // autowoot

            var user = underground.userUtilities.lookupUser(obj.dj.id)
            for(var i = 0; i < underground.room.users.length; i++){
                if(underground.room.users[i].id === user.id){
                    underground.room.users[i].lastDC = {
                        time: null,
                        position: null,
                        songCount: 0
                    };
                }
            }

            var lastplay = obj.lastPlay;
            if (typeof lastplay === 'undefined') return;
            if (underground.settings.songstats) {
                if (typeof underground.chat.songstatistics === "undefined") {
                    API.sendChat("/me :arrow_forward: Last Track: \n" + lastplay.media.author + " - " + lastplay.media.title + ": \n:arrow_up: " + lastplay.score.positive + ", :repeat: " + lastplay.score.grabs + ", :arrow_down: " + lastplay.score.negative + ".");
                }
                else {
                    API.sendChat(subChat("/me :arrow_forward: Last Track: \n" + lastplay.media.author + " - " + lastplay.media.title + ": \n:arrow_up: " + lastplay.score.positive + ", :repeat: " + lastplay.score.grabs + ", :arrow_down: " + lastplay.score.negative + "."));
                }
            }
            underground.room.roomstats.totalWoots += lastplay.score.positive;
            underground.room.roomstats.totalMehs += lastplay.score.negative;
            underground.room.roomstats.totalCurates += lastplay.score.grabs;
            underground.room.roomstats.songCount++;
            underground.roomUtilities.intervalMessage();
            underground.room.currentDJID = obj.dj.id;
            underground.settings.spotLock = "none";
            if (underground.room.currentDJID === underground.settings.approvedDJ) {
                API.sendChat(subChat('/me :arrow_forward: This Track has been approved.'));
                underground.settings.approvedDJ = "[none]";
            }

            var mid = obj.media.format + ':' + obj.media.cid;
            for (var bl in underground.room.blacklists) {
                if (underground.settings.blacklistEnabled) {
                    if (underground.room.blacklists[bl].indexOf(mid) > -1) {
                        API.sendChat(subChat(underground.chat.isblacklisted, {blacklist: bl}));
                        return API.moderateForceSkip();
                    }
                }
            }
            clearTimeout(historySkip);
            if (underground.settings.historySkip) {
                var alreadyPlayed = false;
                var apihistory = API.getHistory();
                var name = obj.dj.username;
                var historySkip = setTimeout(function () {
                    for (var i = 0; i < apihistory.length; i++) {
                        if (apihistory[i].media.cid === obj.media.cid) {
                            API.sendChat(subChat(underground.chat.songknown, {name: name}));
                            API.moderateForceSkip();
                            underground.room.historyList[i].push(+new Date());
                            alreadyPlayed = true;
                        }
                    }
                    if (!alreadyPlayed) {
                        underground.room.historyList.push([obj.media.cid, +new Date()]);
                    }
                }, 2000);
            }
            var newMedia = obj.media;
            if (underground.settings.timeGuard && newMedia.duration > underground.settings.maximumSongLength * 60 && !underground.room.roomevent && obj.dj.id !== underground.settings.approvedDJ) {
                var name = obj.dj.username;
                var id = obj.dj.id;
                API.sendChat('Your song is too long, ' + name + '.');
            }
            if (user.ownSong) {
                API.sendChat(subChat(underground.chat.permissionownsong, {name: user.username}));
                user.ownSong = false;
            }
            clearTimeout(underground.room.autoskipTimer);
            if (underground.room.autoskip) {
                var remaining = obj.media.duration * 1000;
                underground.room.autoskipTimer = setTimeout(function () {
                    console.log("Skipping track.");
                    //API.sendChat('Song stuck, skipping...');
                    API.moderateForceSkip();
                }, remaining + 3000);
            }
            storeToStorage();

        },
        eventWaitlistupdate: function (users) {
            if (users.length < 50) {
                if (underground.room.queue.id.length > 0 && underground.room.queueable) {
                    underground.room.queueable = false;
                    setTimeout(function () {
                        underground.room.queueable = true;
                    }, 500);
                    underground.room.queueing++;
                    var id, pos;
                    setTimeout(
                        function () {
                            id = underground.room.queue.id.splice(0, 1)[0];
                            pos = underground.room.queue.position.splice(0, 1)[0];
                            API.moderateAddDJ(id, pos);
                            setTimeout(
                                function (id, pos) {
                                    API.moderateMoveDJ(id, pos);
                                    underground.room.queueing--;
                                    if (underground.room.queue.id.length === 0) setTimeout(function () {
                                        underground.roomUtilities.booth.unlockBooth();
                                    }, 1000);
                                }, 1000, id, pos);
                        }, 1000 + underground.room.queueing * 2500);
                }
            }
            for (var i = 0; i < users.length; i++) {
                var user = underground.userUtilities.lookupUser(users[i].id);
                underground.userUtilities.updatePosition(user, API.getWaitListPosition(users[i].id) + 1);
            }
        },
        chatcleaner: function (chat) {
            if (!underground.settings.filterChat) return false;
            if (underground.userUtilities.getPermission(chat.uid) > 1) return false;
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
                API.sendChat(subChat(underground.chat.caps, {name: chat.un}));
                return true;
            }
            msg = msg.toLowerCase();
            if (msg === 'skip') {
                API.sendChat(subChat(underground.chat.askskip, {name: chat.un}));
                return true;
            }
            for (var j = 0; j < underground.chatUtilities.spam.length; j++) {
                if (msg === underground.chatUtilities.spam[j]) {
                    API.sendChat(subChat(underground.chat.spam, {name: chat.un}));
                    return true;
                }
            }
            return false;
        },
        chatUtilities: {
            chatFilter: function (chat) {
                var msg = chat.message;
                var perm = underground.userUtilities.getPermission(chat.uid);
                var user = underground.userUtilities.lookupUser(chat.uid);
                var isMuted = false;
                for (var i = 0; i < underground.room.mutedUsers.length; i++) {
                    if (underground.room.mutedUsers[i] === chat.uid) isMuted = true;
                }
                if (isMuted) {
                    API.moderateDeleteChat(chat.cid);
                    API.chatLog('deletion 11');
                    return true;
                }
                if (underground.settings.lockdownEnabled) {
                    if (perm === 0) {
                        API.moderateDeleteChat(chat.cid);
                        API.chatLog('deletion 1');
                        return true;
                    }
                }
                if (underground.chatcleaner(chat)) {
                    API.moderateDeleteChat(chat.cid);
                    API.chatLog('deletion 2');
                    return true;
                }
                /**
                 var plugRoomLinkPatt = /(\bhttps?:\/\/(www.)?plug\.dj[-A-Z0-9+&@#\/%?=~_|!:,.;]*[-A-Z0-9+&@#\/%=~_|])/ig;
                 if (plugRoomLinkPatt.exec(msg)) {
                    if (perm === 0) {
                        API.sendChat(subChat(underground.chat.roomadvertising, {name: chat.un}));
                        API.moderateDeleteChat(chat.cid);
                        return true;
                    }
                }
                 **/
                if (msg.indexOf('http://adf.ly/') > -1) {
                    API.moderateDeleteChat(chat.cid);
                    API.chatLog('deletion 3');
                    API.sendChat(subChat(underground.chat.adfly, {name: chat.un}));
                    return true;
                }
                if (msg.indexOf('autojoin was not enabled') > 0 || msg.indexOf('AFK message was not enabled') > 0 || msg.indexOf('!afkdisable') > 0 || msg.indexOf('!joindisable') > 0 || msg.indexOf('autojoin disabled') > 0 || msg.indexOf('AFK message disabled') > 0) {
                    API.moderateDeleteChat(chat.cid);
                    API.chatLog('deletion 4');
                    return true;
                }

                var rlJoinChat = underground.chat.roulettejoin;
                var rlLeaveChat = underground.chat.rouletteleave;

                var joinedroulette = rlJoinChat.split('%%NAME%%');
                if (joinedroulette[1].length > joinedroulette[0].length) joinedroulette = joinedroulette[1];
                else joinedroulette = joinedroulette[0];

                var leftroulette = rlLeaveChat.split('%%NAME%%');
                if (leftroulette[1].length > leftroulette[0].length) leftroulette = leftroulette[1];
                else leftroulette = leftroulette[0];

                if ((msg.indexOf(joinedroulette) > -1 || msg.indexOf(leftroulette) > -1) && chat.uid === underground.loggedInID) {
                    setTimeout(function (id) {
                        API.moderateDeleteChat(id);
                        API.chatLog('deletion 5');
                    }, 2 * 1000, chat.cid);
                    return true;
                }
                return false;
            },
            commandCheck: function (chat) {
                var cmd;
                if (chat.message.charAt(0) === '!') {
                    var space = chat.message.indexOf(' ');
                    if (space === -1) {
                        cmd = chat.message;
                    }
                    else cmd = chat.message.substring(0, space);
                }
                else return false;
                var userPerm = underground.userUtilities.getPermission(chat.uid);
                //console.log("name: " + chat.un + ", perm: " + userPerm);
                if (chat.message !== "!join" && chat.message !== "!leave") {
                    if (userPerm === 0 && !underground.room.usercommand) return void (0);
                    if (!underground.room.allcommand) return void (0);
                }
                if (chat.message === '!eta' && underground.settings.etaRestriction) {
                    if (userPerm < 2) {
                        var u = underground.userUtilities.lookupUser(chat.uid);
                        if (u.lastEta !== null && (Date.now() - u.lastEta) < 1 * 60 * 60 * 1000) {
                            API.moderateDeleteChat(chat.cid);
                            API.chatLog('deletion 6');
                            return void (0);
                        }
                        else u.lastEta = Date.now();
                    }
                }
                var executed = false;

                for (var comm in underground.commands) {
                    var cmdCall = underground.commands[comm].command;
                    if (!Array.isArray(cmdCall)) {
                        cmdCall = [cmdCall]
                    }
                    for (var i = 0; i < cmdCall.length; i++) {
                        if (underground.settings.commandLiteral + cmdCall[i] === cmd) {
                            underground.commands[comm].functionality(chat, underground.settings.commandLiteral + cmdCall[i]);
                            executed = true;
                            break;
                        }
                    }
                }

                if (executed && userPerm === 0) {
                    underground.room.usercommand = false;
                    setTimeout(function () {
                        underground.room.usercommand = true;
                    }, underground.settings.commandCooldown * 1000);
                }
                if (executed) {
                    if (underground.settings.cmdDeletion) {
                        API.moderateDeleteChat(chat.cid);
                        API.chatLog('deletion 7');
                    }
                    underground.room.allcommand = false;
                    setTimeout(function () {
                        underground.room.allcommand = true;
                    }, 600);
                }
                return executed;
            },
            action: function (chat) {
                var user = underground.userUtilities.lookupUser(chat.uid);
                if (chat.type === 'message') {
                    for (var j = 0; j < underground.room.users.length; j++) {
                        if (underground.userUtilities.getUser(underground.room.users[j]).id === chat.uid) {
                            underground.userUtilities.setLastActivity(underground.room.users[j]);
                        }

                    }
                }
                underground.room.roomstats.chatmessages++;
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
            if (underground.userUtilities.getPermission(u) < 2) return API.chatLog(underground.chat.greyuser);
            if (underground.userUtilities.getPermission(u) === 2) API.chatLog(underground.chat.bouncer);
            underground.connectAPI();
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
                    underground.disconnectAPI();
                    setTimeout(function () {
                        kill();
                    }, 1000);
                }
            };

            Check = setInterval(function(){ detect() }, 100);

            retrieveSettings();
            retrieveFromStorage();
            window.bot = underground;
            underground.roomUtilities.updateBlacklists();
            setInterval(underground.roomUtilities.updateBlacklists, 60 * 60 * 1000);
            underground.getNewBlacklistedSongs = underground.roomUtilities.exportNewBlacklistedSongs;
            underground.logNewBlacklistedSongs = underground.roomUtilities.logNewBlacklistedSongs;
            if (underground.room.roomstats.launchTime === null) {
                underground.room.roomstats.launchTime = Date.now();
            }

            for (var j = 0; j < underground.room.users.length; j++) {
                underground.room.users[j].inRoom = false;
            }
            var userlist = API.getUsers();
            for (var i = 0; i < userlist.length; i++) {
                var known = false;
                var ind = null;
                for (var j = 0; j < underground.room.users.length; j++) {
                    if (underground.room.users[j].id === userlist[i].id) {
                        known = true;
                        ind = j;
                    }
                }
                if (known) {
                    underground.room.users[ind].inRoom = true;
                }
                else {
                    underground.room.users.push(new underground.User(userlist[i].id, userlist[i].username));
                    ind = underground.room.users.length - 1;
                }
                var wlIndex = API.getWaitListPosition(underground.room.users[ind].id) + 1;
                underground.userUtilities.updatePosition(underground.room.users[ind], wlIndex);
            }
            underground.room.afkInterval = setInterval(function () {
                underground.roomUtilities.afkCheck()
            }, 10 * 1000);
            underground.room.autodisableInterval = setInterval(function () {
                underground.room.autodisableFunc();
            }, 60 * 60 * 1000);
            underground.loggedInID = API.getUser().id;
            underground.status = true;
            API.sendChat('/cap ' + underground.settings.startupCap);
            API.setVolume(underground.settings.startupVolume);
            $("#woot").click();
            if (underground.settings.startupEmoji) {
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
            API.chatLog('Avatars capped at ' + underground.settings.startupCap);
            API.chatLog('Volume set to ' + underground.settings.startupVolume);
            loadChat(API.sendChat(subChat(underground.chat.online, {botname: underground.settings.botName, version: underground.version})));
        },
        commands: {
            executable: function (minRank, chat) {
                var id = chat.uid;
                var perm = underground.userUtilities.getPermission(id);
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
                        if (underground.settings.bouncerPlus) {
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
                                if( !underground.commands.executable(this.rank, chat) ) return void (0);
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
                    if (!underground.commands.executable(this.rank, chat)) return void (0);
                    else {
                        var msg = chat.message;
                        var now = Date.now();
                        var chatters = 0;
                        var time;
                        if (msg.length === cmd.length) time = 60;
                        else {
                            time = msg.substring(cmd.length + 1);
                            if (isNaN(time)) return API.sendChat(subChat(underground.chat.invalidtime, {name: chat.un}));
                        }
                        for (var i = 0; i < underground.room.users.length; i++) {
                            userTime = underground.userUtilities.getLastActivity(underground.room.users[i]);
                            if ((now - userTime) <= (time * 60 * 1000)) {
                                chatters++;
                            }
                        }
                        API.sendChat(subChat(underground.chat.activeusersintime, {name: chat.un, amount: chatters, time: time}));
                    }
                }
            },

            addCommand: {
                command: 'add',
                rank: 'mod',
                type: 'startsWith',
                functionality: function (chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void (0);
                    if (!underground.commands.executable(this.rank, chat)) return void (0);
                    else {
                        var msg = chat.message;
                        if (msg.length === cmd.length) return API.sendChat(subChat(underground.chat.nouserspecified, {name: chat.un}));
                        var name = msg.substr(cmd.length + 2);
                        var user = underground.userUtilities.lookupUserName(name);
                        if (msg.length > cmd.length + 2) {
                            if (typeof user !== 'undefined') {
                                if (underground.room.roomevent) {
                                    underground.room.eventArtists.push(user.id);
                                }
                                API.moderateAddDJ(user.id);
                            } else API.sendChat(subChat(underground.chat.invaliduserspecified, {name: chat.un}));
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
                    if (!underground.commands.executable(this.rank, chat)) return void (0);
                    else {
                        var msg = chat.message;
                        if (msg.length === cmd.length) return API.sendChat(subChat(underground.chat.nolimitspecified, {name: chat.un}));
                        var limit = msg.substring(cmd.length + 1);
                        if (!isNaN(limit)) {
                            underground.settings.maximumAfk = parseInt(limit, 10);
                            API.sendChat(subChat(underground.chat.maximumafktimeset, {name: chat.un, time: underground.settings.maximumAfk}));
                        }
                        else API.sendChat(subChat(underground.chat.invalidlimitspecified, {name: chat.un}));
                    }
                }
            },

            afkremovalCommand: {
                command: 'afkremoval',
                rank: 'mod',
                type: 'exact',
                functionality: function (chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void (0);
                    if (!underground.commands.executable(this.rank, chat)) return void (0);
                    else {
                        if (underground.settings.afkRemoval) {
                            underground.settings.afkRemoval = !underground.settings.afkRemoval;
                            clearInterval(underground.room.afkInterval);
                            API.sendChat(subChat(underground.chat.toggleoff, {name: chat.un, 'function': underground.chat.afkremoval}));
                        }
                        else {
                            underground.settings.afkRemoval = !underground.settings.afkRemoval;
                            underground.room.afkInterval = setInterval(function () {
                                underground.roomUtilities.afkCheck()
                            }, 2 * 1000);
                            API.sendChat(subChat(underground.chat.toggleon, {name: chat.un, 'function': underground.chat.afkremoval}));
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
                    if (!underground.commands.executable(this.rank, chat)) return void (0);
                    else {
                        var msg = chat.message;
                        if (msg.length === cmd.length) return API.sendChat(subChat(underground.chat.nouserspecified, {name: chat.un}));
                        var name = msg.substring(cmd.length + 2);
                        var user = underground.userUtilities.lookupUserName(name);
                        if (typeof user === 'boolean') return API.sendChat(subChat(underground.chat.invaliduserspecified, {name: chat.un}));
                        underground.userUtilities.setLastActivity(user);
                        API.sendChat(subChat(underground.chat.afkstatusreset, {name: chat.un, username: name}));
                    }
                }
            },

            afktimeCommand: {
                command: 'afktime',
                rank: 'bouncer',
                type: 'startsWith',
                functionality: function (chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void (0);
                    if (!underground.commands.executable(this.rank, chat)) return void (0);
                    else {
                        var msg = chat.message;
                        if (msg.length === cmd.length) return API.sendChat(subChat(underground.chat.nouserspecified, {name: chat.un}));
                        var name = msg.substring(cmd.length + 2);
                        var user = underground.userUtilities.lookupUserName(name);
                        if (typeof user === 'boolean') return API.sendChat(subChat(underground.chat.invaliduserspecified, {name: chat.un}));
                        var lastActive = underground.userUtilities.getLastActivity(user);
                        var inactivity = Date.now() - lastActive;
                        var time = underground.roomUtilities.msToStr(inactivity);

                        var launchT = underground.room.roomstats.launchTime;
                        var durationOnline = Date.now() - launchT;

                        if (inactivity == durationOnline){
                            API.sendChat(subChat(underground.chat.inactivelonger, {botname: underground.settings.botName, name: chat.un, username: name}));
                        } else {
                            API.sendChat(subChat(underground.chat.inactivefor, {name: chat.un, username: name, time: time}));
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
                    if (!underground.commands.executable(this.rank, chat)) return void (0);
                    else {
                        if (underground.settings.autodisable) {
                            underground.settings.autodisable = !underground.settings.autodisable;
                            return API.sendChat(subChat(underground.chat.toggleoff, {name: chat.un, 'function': underground.chat.autodisable}));
                        }
                        else {
                            underground.settings.autodisable = !underground.settings.autodisable;
                            return API.sendChat(subChat(underground.chat.toggleon, {name: chat.un, 'function': underground.chat.autodisable}));
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
                    if (!underground.commands.executable(this.rank, chat)) return void (0);
                    else {
                        if (underground.room.autoskip) {
                            underground.room.autoskip = !underground.room.autoskip;
                            clearTimeout(underground.room.autoskipTimer);
                            return API.sendChat(subChat(underground.chat.toggleoff, {name: chat.un, 'function': underground.chat.autoskip}));
                        }
                        else {
                            underground.room.autoskip = !underground.room.autoskip;
                            return API.sendChat(subChat(underground.chat.toggleon, {name: chat.un, 'function': underground.chat.autoskip}));
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
                    if (!underground.commands.executable(this.rank, chat)) return void (0);
                    else {
                        API.sendChat(underground.chat.autowoot);
                    }
                }
            },

            baCommand: {
                command: 'ba',
                rank: 'user',
                type: 'exact',
                functionality: function (chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void (0);
                    if (!underground.commands.executable(this.rank, chat)) return void (0);
                    else {
                        API.sendChat(underground.chat.brandambassador);
                    }
                }
            },

            ballCommand: {
                command: ['8ball', 'ask'],
                rank: 'user',
                type: 'startsWith',
                functionality: function (chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void (0);
                    if (!underground.commands.executable(this.rank, chat)) return void (0);
                    else {
                        var crowd = API.getUsers();
                        var msg = chat.message;
                        var argument = msg.substring(cmd.length + 1);
                        var randomUser = Math.floor(Math.random() * crowd.length);
                        var randomBall = Math.floor(Math.random() * underground.chat.balls.length);
                        var randomSentence = Math.floor(Math.random() * 1);
                        API.sendChat(subChat(underground.chat.ball, {name: chat.un, botname: underground.settings.botName, question: argument, response: underground.chat.balls[randomBall]}));
                    }
                }
            },

            banCommand: {
                command: 'ban',
                rank: 'bouncer',
                type: 'startsWith',
                functionality: function (chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void (0);
                    if (!underground.commands.executable(this.rank, chat)) return void (0);
                    else {
                        var msg = chat.message;
                        if (msg.length === cmd.length) return API.sendChat(subChat(underground.chat.nouserspecified, {name: chat.un}));
                        var name = msg.substr(cmd.length + 2);
                        var user = underground.userUtilities.lookupUserName(name);
                        if (typeof user === 'boolean') return API.sendChat(subChat(underground.chat.invaliduserspecified, {name: chat.un}));
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
                    if (!underground.commands.executable(this.rank, chat)) return void (0);
                    else {
                        var msg = chat.message;
                        if (msg.length === cmd.length) return API.sendChat(subChat(underground.chat.nolistspecified, {name: chat.un}));
                        var list = msg.substr(cmd.length + 1);
                        if (typeof underground.room.blacklists[list] === 'undefined') return API.sendChat(subChat(underground.chat.invalidlistspecified, {name: chat.un}));
                        else {
                            var media = API.getMedia();
                            var track = {
                                list: list,
                                author: media.author,
                                title: media.title,
                                mid: media.format + ':' + media.cid
                            };
                            underground.room.newBlacklisted.push(track);
                            underground.room.blacklists[list].push(media.format + ':' + media.cid);
                            API.sendChat(subChat(underground.chat.newblacklisted, {name: chat.un, blacklist: list, author: media.author, title: media.title, mid: media.format + ':' + media.cid}));
                            API.moderateForceSkip();
                            if (typeof underground.room.newBlacklistedSongFunction === 'function') {
                                underground.room.newBlacklistedSongFunction(track);
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
                    if (!underground.commands.executable(this.rank, chat)) return void (0);
                    else {
                        var author = API.getMedia().author;
                        var title = API.getMedia().title;
                        var name = chat.un;
                        var format = API.getMedia().format;
                        var cid = API.getMedia().cid;
                        var songid = format + ":" + cid;

                        API.sendChat(subChat(underground.chat.blinfo, {name: name, author: author, title: title, songid: songid}));
                    }
                }
            },

            bouncerPlusCommand: {
                command: 'bouncer+',
                rank: 'mod',
                type: 'exact',
                functionality: function (chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void (0);
                    if (!underground.commands.executable(this.rank, chat)) return void (0);
                    else {
                        var msg = chat.message;
                        if (underground.settings.bouncerPlus) {
                            underground.settings.bouncerPlus = false;
                            return API.sendChat(subChat(underground.chat.toggleoff, {name: chat.un, 'function': 'Bouncer+'}));
                        }
                        else {
                            if (!underground.settings.bouncerPlus) {
                                var id = chat.uid;
                                var perm = underground.userUtilities.getPermission(id);
                                if (perm > 2) {
                                    underground.settings.bouncerPlus = true;
                                    return API.sendChat(subChat(underground.chat.toggleon, {name: chat.un, 'function': 'Bouncer+'}));
                                }
                            }
                            else return API.sendChat(subChat(underground.chat.bouncerplusrank, {name: chat.un}));
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
                    if (!underground.commands.executable(this.rank, chat)) return void (0);
                    else {
                        var msg = chat.message;
                        if (msg.length <= cmd.length + 1) return API.sendChat(subChat(underground.chat.currentbotname, {botname: underground.settings.botName}));
                        var argument = msg.substring(cmd.length + 1);
                        if (argument) {
                            underground.settings.botName = argument;
                            API.sendChat(subChat(underground.chat.botnameset, {botName: underground.settings.botName}));
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
                    if (!underground.commands.executable(this.rank, chat)) return void (0);
                    else {
                        var currentchat = $('#chat-messages').children();
                        for (var i = 0; i < currentchat.length; i++) {
                            API.moderateDeleteChat(currentchat[i].getAttribute("data-cid"));
                            API.chatLog('deletion 8');
                        }
                        return API.sendChat(subChat(underground.chat.chatcleared, {name: chat.un}));
                    }
                }
            },

            commandsCommand: {
                command: 'commands',
                rank: 'user',
                type: 'exact',
                functionality: function (chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void (0);
                    if (!underground.commands.executable(this.rank, chat)) return void (0);
                    else {
                        API.sendChat('/me A list of all available commands can be found here: https://github.com/Paradox68/UndergroundBot/blob/master/commands.md');
                    }
                }
            },

            cmddeletionCommand: {
                command: ['commanddeletion', 'cmddeletion', 'cmddel'],
                rank: 'mod',
                type: 'exact',
                functionality: function (chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void (0);
                    if (!underground.commands.executable(this.rank, chat)) return void (0);
                    else {
                        if (underground.settings.cmdDeletion) {
                            underground.settings.cmdDeletion = !underground.settings.cmdDeletion;
                            API.sendChat(subChat(underground.chat.toggleoff, {name: chat.un, 'function': underground.chat.cmddeletion}));
                        }
                        else {
                            underground.settings.cmdDeletion = !underground.settings.cmdDeletion;
                            API.sendChat(subChat(underground.chat.toggleon, {name: chat.un, 'function': underground.chat.cmddeletion}));
                        }
                    }
                }
            },

            cookieCommand: {
                command: 'cookie',
                rank: 'user',
                type: 'startsWith',
                getCookie: function (chat) {
                    var c = Math.floor(Math.random() * underground.chat.cookies.length);
                    return underground.chat.cookies[c];
                },
                functionality: function (chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void (0);
                    if (!underground.commands.executable(this.rank, chat)) return void (0);
                    else {
                        var msg = chat.message;

                        var space = msg.indexOf(' ');
                        if (space === -1) {
                            API.sendChat(underground.chat.eatcookie);
                            return false;
                        }
                        else {
                            var name = msg.substring(space + 2);
                            var user = underground.userUtilities.lookupUserName(name);
                            if (user === false || !user.inRoom) {
                                return API.sendChat(subChat(underground.chat.nousercookie, {name: name}));
                            }
                            else if (user.username === chat.un) {
                                return API.sendChat(subChat(underground.chat.selfcookie, {name: name}));
                            }
                            else {
                                return API.sendChat(subChat(underground.chat.cookie, {nameto: user.username, namefrom: chat.un, cookie: this.getCookie()}));
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
                    if (!underground.commands.executable(this.rank, chat)) return void (0);
                    else {
                        underground.roomUtilities.changeDJCycle();
                    }
                }
            },

            cycleguardCommand: {
                command: 'cycleguard',
                rank: 'bouncer',
                type: 'exact',
                functionality: function (chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void (0);
                    if (!underground.commands.executable(this.rank, chat)) return void (0);
                    else {
                        if (underground.settings.cycleGuard) {
                            underground.settings.cycleGuard = !underground.settings.cycleGuard;
                            return API.sendChat(subChat(underground.chat.toggleoff, {name: chat.un, 'function': underground.chat.cycleguard}));
                        }
                        else {
                            underground.settings.cycleGuard = !underground.settings.cycleGuard;
                            return API.sendChat(subChat(underground.chat.toggleon, {name: chat.un, 'function': underground.chat.cycleguard}));
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
                    if (!underground.commands.executable(this.rank, chat)) return void (0);
                    else {
                        var msg = chat.message;
                        var cycleTime = msg.substring(cmd.length + 1);
                        if (!isNaN(cycleTime) && cycleTime !== "") {
                            underground.settings.maximumCycletime = cycleTime;
                            return API.sendChat(subChat(underground.chat.cycleguardtime, {name: chat.un, time: underground.settings.maximumCycletime}));
                        }
                        else return API.sendChat(subChat(underground.chat.invalidtime, {name: chat.un}));

                    }
                }
            },

            dclookupCommand: {
                command: ['dclookup', 'dc'],
                rank: 'user',
                type: 'startsWith',
                functionality: function (chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void (0);
                    if (!underground.commands.executable(this.rank, chat)) return void (0);
                    else {
                        var msg = chat.message;
                        var name;
                        if (msg.length === cmd.length) name = chat.un;
                        else {
                            name = msg.substring(cmd.length + 2);
                            var perm = underground.userUtilities.getPermission(chat.uid);
                            if (perm < 2) return API.sendChat(subChat(underground.chat.dclookuprank, {name: chat.un}));
                        }
                        var user = underground.userUtilities.lookupUserName(name);
                        if (typeof user === 'boolean') return API.sendChat(subChat(underground.chat.invaliduserspecified, {name: chat.un}));
                        var toChat = underground.userUtilities.dclookup(user.id);
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
             if (!underground.commands.executable(this.rank, chat)) return void (0);
             else {
             var msg = chat.message;
             if (msg.length === cmd.length) return API.sendChat(subChat(underground.chat.nouserspecified, {name: chat.un}));
             var name = msg.substring(cmd.length + 2);
             var user = underground.userUtilities.lookupUserName(name);
             if (typeof user === 'boolean') return API.sendChat(subChat(underground.chat.invaliduserspecified, {name: chat.un}));
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
             API.sendChat(subChat(underground.chat.deletechat, {name: chat.un, username: name}));
             }
             }
             },*/

            emojiCommand: {
                command: 'emoji',
                rank: 'user',
                type: 'exact',
                functionality: function (chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void (0);
                    if (!underground.commands.executable(this.rank, chat)) return void (0);
                    else {
                        var link = 'http://www.emoji-cheat-sheet.com/';
                        API.sendChat(subChat(underground.chat.emojilist, {link: link}));
                    }
                }
            },

            englishCommand: {
                command: 'english',
                rank: 'bouncer',
                type: 'startsWith',
                functionality: function (chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void (0);
                    if (!underground.commands.executable(this.rank, chat)) return void (0);
                    else {
                        if(chat.message.length === cmd.length) return API.sendChat('/me No user specified.');
                        var name = chat.message.substring(cmd.length + 2);
                        var user = underground.userUtilities.lookupUserName(name);
                        if(typeof user === 'boolean') return API.sendChat('/me Invalid user specified.');
                        var lang = underground.userUtilities.getUser(user).language;
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
                    if (!underground.commands.executable(this.rank, chat)) return void (0);
                    else {
                        var perm = underground.userUtilities.getPermission(chat.uid);
                        var msg = chat.message;
                        var name;
                        if (msg.length > cmd.length) {
                            if (perm < 2) return void (0);
                            name = msg.substring(cmd.length + 2);
                        } else name = chat.un;
                        var user = underground.userUtilities.lookupUserName(name);
                        if (typeof user === 'boolean') return API.sendChat(subChat(underground.chat.invaliduserspecified, {name: chat.un}));
                        var pos = API.getWaitListPosition(user.id);
                        if (pos < 0) return API.sendChat(subChat(underground.chat.notinwaitlist, {name: name}));
                        var timeRemaining = API.getTimeRemaining();
                        var estimateMS = ((pos + 1) * 4 * 60 + timeRemaining) * 1000;
                        var estimateString = underground.roomUtilities.msToStr(estimateMS);
                        API.sendChat(subChat(underground.chat.eta, {name: name, time: estimateString}));
                    }
                }
            },

            fbCommand: {
                command: 'fb',
                rank: 'user',
                type: 'exact',
                functionality: function (chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void (0);
                    if (!underground.commands.executable(this.rank, chat)) return void (0);
                    else {
                        if (typeof underground.settings.fbLink === "string")
                            API.sendChat(subChat(underground.chat.facebook, {link: underground.settings.fbLink}));
                    }
                }
            },

            filterCommand: {
                command: 'filter',
                rank: 'bouncer',
                type: 'exact',
                functionality: function (chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void (0);
                    if (!underground.commands.executable(this.rank, chat)) return void (0);
                    else {
                        if (underground.settings.filterChat) {
                            underground.settings.filterChat = !underground.settings.filterChat;
                            return API.sendChat(subChat(underground.chat.toggleoff, {name: chat.un, 'function': underground.chat.chatfilter}));
                        }
                        else {
                            underground.settings.filterChat = !underground.settings.filterChat;
                            return API.sendChat(subChat(underground.chat.toggleon, {name: chat.un, 'function': underground.chat.chatfilter}));
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
                    if (!underground.commands.executable(this.rank, chat)) return void (0);
                    else {
                        var msg = chat.message;
                        var name;
                        if (msg.length === cmd.length) name = chat.un;
                        else {
                            name = msg.substr(cmd.length + 2);
                        }
                        var user = underground.userUtilities.lookupUserName(name);
                        if (user === false || !user.inRoom) {
                            return API.sendChat(subChat(underground.chat.ghosting, {name1: chat.un, name2: name}));
                        }
                        else API.sendChat(subChat(underground.chat.notghosting, {name1: chat.un, name2: name}));
                    }
                }
            },

            gifCommand: {
                command: ['gif', 'giphy'],
                rank: 'user',
                type: 'startsWith',
                functionality: function (chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void (0);
                    if (!underground.commands.executable(this.rank, chat)) return void (0);
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
                                    API.sendChat(subChat(underground.chat.validgiftags, {name: chat.un, id: id, tags: commatag}));
                                } else {
                                    API.sendChat(subChat(underground.chat.invalidgiftags, {name: chat.un, tags: commatag}));
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
                                    API.sendChat(subChat(underground.chat.validgifrandom, {name: chat.un, id: id}));
                                } else {
                                    API.sendChat(subChat(underground.chat.invalidgifrandom, {name: chat.un}));
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
                    if (!underground.commands.executable(this.rank, chat)) return void (0);
                    else {
                        var link = "(Updated link coming soon)";
                        API.sendChat(subChat(underground.chat.starterhelp, {link: link}));
                    }
                }
            },

            historyskipCommand: {
                command: 'historyskip',
                rank: 'bouncer',
                type: 'exact',
                functionality: function (chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void (0);
                    if (!underground.commands.executable(this.rank, chat)) return void (0);
                    else {
                        if (underground.settings.historySkip) {
                            underground.settings.historySkip = !underground.settings.historySkip;
                            API.sendChat(subChat(underground.chat.toggleoff, {name: chat.un, 'function': underground.chat.historyskip}));
                        }
                        else {
                            underground.settings.historySkip = !underground.settings.historySkip;
                            API.sendChat(subChat(underground.chat.toggleon, {name: chat.un, 'function': underground.chat.historyskip}));
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
             if (!underground.commands.executable(this.rank, chat)) return void (0);
             else {
             if (!underground.room.russiangame.RRStatus) {
             underground.room.russiangame.startRussianGame();
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
             if (!underground.commands.executable(this.rank, chat)) { return void (0); }
             if (underground.room.russiangame.players >= 6) { return void (0); }
             if (underground.room.russiangame.started) { return void (0); }
             if (underground.room.russiangame.rusStatus && underground.room.russiangame.participants.indexOf(chat.uid) < 0) {
             underground.room.russiangame.participants.push(chat.uid);
             API.sendChat('/me ' + chat.un + ' has claimed his seat in Russian Roulette');
             underground.room.russiangame.players += 1;
             if (underground.room.russiangame.players == 6) {
             underground.room.russiangame.started = true;
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
                    if (!underground.commands.executable(this.rank, chat)) return void (0);
                    else {
                        if (underground.room.roulette.rouletteStatus && underground.room.roulette.participants.indexOf(chat.uid) < 0) {
                            underground.room.roulette.participants.push(chat.uid);
                            API.sendChat(subChat(underground.chat.roulettejoin, {name: chat.un}));
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
                    if (!underground.commands.executable(this.rank, chat)) return void (0);
                    else {
                        var msg = chat.message;
                        if (msg.length === cmd.length) return API.sendChat(subChat(underground.chat.nouserspecified, {name: chat.un}));
                        var name = msg.substring(cmd.length + 2);
                        var user = underground.userUtilities.lookupUserName(name);
                        if (typeof user === 'boolean') return API.sendChat(subChat(underground.chat.invaliduserspecified, {name: chat.un}));
                        var join = underground.userUtilities.getJointime(user);
                        var time = Date.now() - join;
                        var timeString = underground.roomUtilities.msToStr(time);
                        API.sendChat(subChat(underground.chat.jointime, {namefrom: chat.un, username: name, time: timeString}));
                    }
                }
            },

            kickCommand: {
                command: 'kick',
                rank: 'bouncer',
                type: 'startsWith',
                functionality: function (chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void (0);
                    if (!underground.commands.executable(this.rank, chat)) return void (0);
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

                        var user = underground.userUtilities.lookupUserName(name);
                        var from = chat.un;
                        if (typeof user === 'boolean') return API.sendChat(subChat(underground.chat.nouserspecified, {name: chat.un}));

                        var permFrom = underground.userUtilities.getPermission(chat.uid);
                        var permTokick = underground.userUtilities.getPermission(user.id);

                        if (permFrom <= permTokick)
                            return API.sendChat(subChat(underground.chat.kickrank, {name: chat.un}));

                        if (!isNaN(time)) {
                            API.sendChat(subChat(underground.chat.kick, {name: chat.un, username: name, time: time}));
                            if (time > 24 * 60 * 60) API.moderateBanUser(user.id, 1, API.BAN.PERMA);
                            else API.moderateBanUser(user.id, 1, API.BAN.DAY);
                            setTimeout(function (id, name) {
                                API.moderateUnbanUser(id);
                                console.log('Unbanned @' + name + '. (' + id + ')');
                            }, time * 60 * 1000, user.id, name);
                        }
                        else API.sendChat(subChat(underground.chat.invalidtime, {name: chat.un}));
                    }
                }
            },

            killCommand: {
                command: 'kill',
                rank: 'bouncer',
                type: 'exact',
                functionality: function (chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void (0);
                    if (!underground.commands.executable(this.rank, chat)) return void (0);
                    else {
                        storeToStorage();
                        API.sendChat(underground.chat.kill);
                        underground.disconnectAPI();
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
                    if (!underground.commands.executable(this.rank, chat)) return void (0);
                    else {
                        var msg = chat.message;
                        if (msg.length <= cmd.length + 1) return API.sendChat(subChat(underground.chat.currentlang, {language: underground.settings.language}));
                        var argument = msg.substring(cmd.length + 1);

                        $.get("https://rawgit.com/Paradox68/UndergroundBot/master/lang/langIndex.json", function (json) {
                            var langIndex = json;
                            var link = langIndex[argument.toLowerCase()];
                            if (typeof link === "undefined") {
                                API.sendChat(subChat(underground.chat.langerror, {link: "http://git.io/vJ9nI"}));
                            }
                            else {
                                underground.settings.language = argument;
                                loadChat();
                                API.sendChat(subChat(underground.chat.langset, {language: underground.settings.language}));
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
                    if (!underground.commands.executable(this.rank, chat)) return void (0);
                    else {
                        var ind = underground.room.roulette.participants.indexOf(chat.uid);
                        if (ind > -1) {
                            underground.room.roulette.participants.splice(ind, 1);
                            API.sendChat(subChat(underground.chat.rouletteleave, {name: chat.un}));
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
                    if (!underground.commands.executable(this.rank, chat)) return void (0);
                    else {
                        var media = API.getMedia();
                        var from = chat.un;
                        var user = underground.userUtilities.lookupUser(chat.uid);
                        var perm = underground.userUtilities.getPermission(chat.uid);
                        var dj = API.getDJ().id;
                        var isDj = false;
                        if (dj === chat.uid) isDj = true;
                        if (perm >= 1 || isDj) {
                            if (media.format === 1) {
                                var linkToSong = "http://youtu.be/" + media.cid;
                                API.sendChat(subChat(underground.chat.songlink, {name: from, link: linkToSong}));
                            }
                            if (media.format === 2) {
                                SC.get('/tracks/' + media.cid, function (sound) {
                                    API.sendChat(subChat(underground.chat.songlink, {name: from, link: sound.permalink_url}));
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
                    if (!underground.commands.executable(this.rank, chat)) return void (0);
                    else {
                        underground.roomUtilities.booth.lockBooth();
                    }
                }
            },

            lockdownCommand: {
                command: 'lockdown',
                rank: 'mod',
                type: 'exact',
                functionality: function (chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void (0);
                    if (!underground.commands.executable(this.rank, chat)) return void (0);
                    else {
                        var temp = underground.settings.lockdownEnabled;
                        underground.settings.lockdownEnabled = !temp;
                        if (underground.settings.lockdownEnabled) {
                            return API.sendChat(subChat(underground.chat.toggleon, {name: chat.un, 'function': underground.chat.lockdown}));
                        }
                        else return API.sendChat(subChat(underground.chat.toggleoff, {name: chat.un, 'function': underground.chat.lockdown}));
                    }
                }
            },

            lockguardCommand: {
                command: 'lockguard',
                rank: 'bouncer',
                type: 'exact',
                functionality: function (chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void (0);
                    if (!underground.commands.executable(this.rank, chat)) return void (0);
                    else {
                        if (underground.settings.lockGuard) {
                            underground.settings.lockGuard = !underground.settings.lockGuard;
                            return API.sendChat(subChat(underground.chat.toggleoff, {name: chat.un, 'function': underground.chat.lockguard}));
                        }
                        else {
                            underground.settings.lockGuard = !underground.settings.lockGuard;
                            return API.sendChat(subChat(underground.chat.toggleon, {name: chat.un, 'function': underground.chat.lockguard}));
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
                    if (!underground.commands.executable(this.rank, chat)) return void (0);
                    else {
                        var dj = API.getDJ();
                        var id = dj.id;
                        var name = dj.username;
                        var msgSend = '@' + name + ': ';
                        underground.room.queueable = false;

                        if (chat.message.length === cmd.length) {
                            API.sendChat(subChat(underground.chat.usedlockskip, {name: chat.un}));
                            underground.roomUtilities.booth.lockBooth();
                            setTimeout(function (id) {
                                API.moderateForceSkip();
                                underground.room.skippable = false;
                                setTimeout(function () {
                                    underground.room.skippable = true
                                }, 5 * 1000);
                                setTimeout(function (id) {
                                    underground.userUtilities.moveUser(id, underground.settings.lockskipPosition, false);
                                    underground.room.queueable = true;
                                    setTimeout(function () {
                                        underground.roomUtilities.booth.unlockBooth();
                                    }, 1000);
                                }, 1500, id);
                            }, 1000, id);
                            return void (0);
                        }
                        var validReason = false;
                        var msg = chat.message;
                        var reason = msg.substring(cmd.length + 1);
                        for (var i = 0; i < underground.settings.lockskipReasons.length; i++) {
                            var r = underground.settings.lockskipReasons[i][0];
                            if (reason.indexOf(r) !== -1) {
                                validReason = true;
                                msgSend += underground.settings.lockskipReasons[i][1];
                            }
                        }
                        if (validReason) {
                            API.sendChat(subChat(underground.chat.usedlockskip, {name: chat.un}));
                            underground.roomUtilities.booth.lockBooth();
                            setTimeout(function (id) {
                                API.moderateForceSkip();
                                underground.room.skippable = false;
                                API.sendChat(msgSend);
                                setTimeout(function () {
                                    underground.room.skippable = true
                                }, 5 * 1000);
                                setTimeout(function (id) {
                                    underground.userUtilities.moveUser(id, underground.settings.lockskipPosition, false);
                                    underground.room.queueable = true;
                                    setTimeout(function () {
                                        underground.roomUtilities.booth.unlockBooth();
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
                    if (!underground.commands.executable(this.rank, chat)) return void (0);
                    else {
                        var msg = chat.message;
                        var pos = msg.substring(cmd.length + 1);
                        if (!isNaN(pos)) {
                            underground.settings.lockskipPosition = pos;
                            return API.sendChat(subChat(underground.chat.lockskippos, {name: chat.un, position: underground.settings.lockskipPosition}));
                        }
                        else return API.sendChat(subChat(underground.chat.invalidpositionspecified, {name: chat.un}));
                    }
                }
            },

            locktimerCommand: {
                command: 'locktimer',
                rank: 'manager',
                type: 'startsWith',
                functionality: function (chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void (0);
                    if (!underground.commands.executable(this.rank, chat)) return void (0);
                    else {
                        var msg = chat.message;
                        var lockTime = msg.substring(cmd.length + 1);
                        if (!isNaN(lockTime) && lockTime !== "") {
                            underground.settings.maximumLocktime = lockTime;
                            return API.sendChat(subChat(underground.chat.lockguardtime, {name: chat.un, time: underground.settings.maximumLocktime}));
                        }
                        else return API.sendChat(subChat(underground.chat.invalidtime, {name: chat.un}));
                    }
                }
            },

            logoutCommand: {
                command: 'logout',
                rank: 'manager',
                type: 'exact',
                functionality: function (chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void (0);
                    if (!underground.commands.executable(this.rank, chat)) return void (0);
                    else {
                        API.sendChat(subChat(underground.chat.logout, {name: chat.un, botname: underground.settings.botName}));
                        setTimeout(function () {
                            $(".logout").mousedown()
                        }, 1000);
                    }
                }
            },

            maxlengthCommand: {
                command: 'maxlength',
                rank: 'manager',
                type: 'startsWith',
                functionality: function (chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void (0);
                    if (!underground.commands.executable(this.rank, chat)) return void (0);
                    else {
                        var msg = chat.message;
                        var maxTime = msg.substring(cmd.length + 1);
                        if (!isNaN(maxTime)) {
                            underground.settings.maximumSongLength = maxTime;
                            return API.sendChat(subChat(underground.chat.maxlengthtime, {name: chat.un, time: underground.settings.maximumSongLength}));
                        }
                        else return API.sendChat(subChat(underground.chat.invalidtime, {name: chat.un}));
                    }
                }
            },

            motdCommand: {
                command: 'motd',
                rank: 'bouncer',
                type: 'startsWith',
                functionality: function (chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void (0);
                    if (!underground.commands.executable(this.rank, chat)) return void (0);
                    else {
                        var msg = chat.message;
                        if (msg.length <= cmd.length + 1) return API.sendChat('/me MotD: ' + underground.settings.motd);
                        var argument = msg.substring(cmd.length + 1);
                        if (!underground.settings.motdEnabled) underground.settings.motdEnabled = !underground.settings.motdEnabled;
                        if (isNaN(argument)) {
                            underground.settings.motd = argument;
                            API.sendChat(subChat(underground.chat.motdset, {msg: underground.settings.motd}));
                        }
                        else {
                            underground.settings.motdInterval = argument;
                            API.sendChat(subChat(underground.chat.motdintervalset, {interval: underground.settings.motdInterval}));
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
                    if (!underground.commands.executable(this.rank, chat)) return void (0);
                    else {
                        var msg = chat.message;
                        if (msg.length === cmd.length) return API.sendChat(subChat(underground.chat.nouserspecified, {name: chat.un}));
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
                        var user = underground.userUtilities.lookupUserName(name);
                        if (typeof user === 'boolean') return API.sendChat(subChat(underground.chat.invaliduserspecified, {name: chat.un}));
                        if (user.id === underground.loggedInID) return API.sendChat(subChat(underground.chat.addbotwaitlist, {name: chat.un}));
                        if (!isNaN(pos)) {
                            API.sendChat(subChat(underground.chat.move, {name: chat.un}));
                            underground.userUtilities.moveUser(user.id, pos, false);
                        } else return API.sendChat(subChat(underground.chat.invalidpositionspecified, {name: chat.un}));
                    }
                }
            },

            muteCommand: {
                command: 'mute',
                rank: 'bouncer',
                type: 'startsWith',
                functionality: function (chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void (0);
                    if (!underground.commands.executable(this.rank, chat)) return void (0);
                    else {
                        var msg = chat.message;
                        if (msg.length === cmd.length) return API.sendChat(subChat(underground.chat.nouserspecified, {name: chat.un}));
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
                                return API.sendChat(subChat(underground.chat.invalidtime, {name: chat.un}));
                            }
                            name = msg.substring(cmd.length + 2, lastSpace);
                        }
                        var from = chat.un;
                        var user = underground.userUtilities.lookupUserName(name);
                        if (typeof user === 'boolean') return API.sendChat(subChat(underground.chat.invaliduserspecified, {name: chat.un}));
                        var permFrom = underground.userUtilities.getPermission(chat.uid);
                        var permUser = underground.userUtilities.getPermission(user.id);
                        if (permFrom > permUser) {

                            underground.room.mutedUsers.push(user.id);
                            if (time === null) API.sendChat(subChat(underground.chat.mutednotime, {name: chat.un, username: name}));
                            else {
                                API.sendChat(subChat(underground.chat.mutedtime, {name: chat.un, username: name, time: time}));
                                setTimeout(function (id) {
                                    var muted = underground.room.mutedUsers;
                                    var wasMuted = false;
                                    var indexMuted = -1;
                                    for (var i = 0; i < muted.length; i++) {
                                        if (muted[i] === id) {
                                            indexMuted = i;
                                            wasMuted = true;
                                        }
                                    }
                                    if (indexMuted > -1) {
                                        underground.room.mutedUsers.splice(indexMuted);
                                        var u = underground.userUtilities.lookupUser(id);
                                        var name = u.username;
                                        API.sendChat(subChat(underground.chat.unmuted, {name: chat.un, username: name}));
                                    }
                                }, time * 60 * 1000, user.id);
                            }

                            if (time > 45) {
                                API.sendChat(subChat(underground.chat.mutedmaxtime, {name: chat.un, time: "45"}));
                                API.moderateMuteUser(user.id, 1, API.MUTE.LONG);
                            }
                            else if (time === 45) {
                                API.moderateMuteUser(user.id, 1, API.MUTE.LONG);
                                API.sendChat(subChat(underground.chat.mutedtime, {name: chat.un, username: name, time: time}));

                            }
                            else if (time > 30) {
                                API.moderateMuteUser(user.id, 1, API.MUTE.LONG);
                                API.sendChat(subChat(underground.chat.mutedtime, {name: chat.un, username: name, time: time}));
                                setTimeout(function (id) {
                                    API.moderateUnmuteUser(id);
                                }, time * 60 * 1000, user.id);
                            }
                            else if (time > 15) {
                                API.moderateMuteUser(user.id, 1, API.MUTE.MEDIUM);
                                API.sendChat(subChat(underground.chat.mutedtime, {name: chat.un, username: name, time: time}));
                                setTimeout(function (id) {
                                    API.moderateUnmuteUser(id);
                                }, time * 60 * 1000, user.id);
                            }
                            else {
                                API.moderateMuteUser(user.id, 1, API.MUTE.SHORT);
                                API.sendChat(subChat(underground.chat.mutedtime, {name: chat.un, username: name, time: time}));
                                setTimeout(function (id) {
                                    API.moderateUnmuteUser(id);
                                }, time * 60 * 1000, user.id);
                            }
                        }
                        else API.sendChat(subChat(underground.chat.muterank, {name: chat.un}));
                    }
                }
            },

            opCommand: {
                command: 'op',
                rank: 'user',
                type: 'exact',
                functionality: function (chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void (0);
                    if (!underground.commands.executable(this.rank, chat)) return void (0);
                    else {
                        if (typeof underground.settings.opLink === "string")
                            return API.sendChat(subChat(underground.chat.oplist, {link: underground.settings.opLink}));
                    }
                }
            },

            pingCommand: {
                command: 'ping',
                rank: 'user',
                type: 'exact',
                functionality: function (chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void (0);
                    if (!underground.commands.executable(this.rank, chat)) return void (0);
                    else {
                        API.sendChat(underground.chat.pong)
                    }
                }
            },

            /*refreshCommand: {
             command: 'refresh',
             rank: 'manager',
             type: 'exact',
             functionality: function (chat, cmd) {
             if (this.type === 'exact' && chat.message.length !== cmd.length) return void (0);
             if (!underground.commands.executable(this.rank, chat)) return void (0);
             else {
             storeToStorage();
             underground.disconnectAPI();
             setTimeout(function () {
             window.location.reload(false);
             }, 1000);

             }
             }
             },*/

            reloadCommand: {
                command: 'reload',
                rank: 'bouncer',
                type: 'exact',
                functionality: function (chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void (0);
                    if (!underground.commands.executable(this.rank, chat)) return void (0);
                    else {
                        API.sendChat(underground.chat.reload);
                        storeToStorage();
                        underground.disconnectAPI();
                        kill();
                        setTimeout(function () {
                            $.getScript(underground.scriptLink);
                        }, 2000);
                    }
                }
            },


            madebyCommand: {
                command: 'madeby',
                rank: 'user',
                type: 'exact',
                functionality: function (chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void (0);
                    if (!underground.commands.executable(this.rank, chat)) return void (0);
                    else {
                        API.sendChat('The ' + underground.settings.botName +  'was developed and is operated by Paradox VII');
                    }
                }
            },

            removeCommand: {
                command: 'remove',
                rank: 'mod',
                type: 'startsWith',
                functionality: function (chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void (0);
                    if (!underground.commands.executable(this.rank, chat)) return void (0);
                    else {
                        var msg = chat.message;
                        if (msg.length > cmd.length + 2) {
                            var name = msg.substr(cmd.length + 2);
                            var user = underground.userUtilities.lookupUserName(name);
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
                            } else API.sendChat(subChat(underground.chat.removenotinwl, {name: chat.un, username: name}));
                        } else API.sendChat(subChat(underground.chat.nouserspecified, {name: chat.un}));
                    }
                }
            },

            restrictetaCommand: {
                command: 'restricteta',
                rank: 'bouncer',
                type: 'exact',
                functionality: function (chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void (0);
                    if (!underground.commands.executable(this.rank, chat)) return void (0);
                    else {
                        if (underground.settings.etaRestriction) {
                            underground.settings.etaRestriction = !underground.settings.etaRestriction;
                            return API.sendChat(subChat(underground.chat.toggleoff, {name: chat.un, 'function': underground.chat.etarestriction}));
                        }
                        else {
                            underground.settings.etaRestriction = !underground.settings.etaRestriction;
                            return API.sendChat(subChat(underground.chat.toggleon, {name: chat.un, 'function': underground.chat.etarestriction}));
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
                    if (!underground.commands.executable(this.rank, chat)) return void (0);
                    else {
                        if (!underground.room.roulette.rouletteStatus) {
                            underground.room.roulette.startRoulette();
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
                    if (!underground.commands.executable(this.rank, chat)) return void (0);
                    else {
                        if (!underground.room.dicegame.dgStatus) {
                            underground.room.dicegame.highestRoll = 0;
                            underground.room.dicegame.highestRollerID = null;
                            underground.room.dicegame.participants = [];
                            underground.room.dicegame.startDiceGame();
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
                    if (!underground.commands.executable(this.rank, chat)) return void (0);
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
                    if (!underground.commands.executable(this.rank, chat)) return void (0);
                    else {
                        var from = chat.un;
                        var woots = underground.room.roomstats.totalWoots;
                        var mehs = underground.room.roomstats.totalMehs;
                        var grabs = underground.room.roomstats.totalCurates;
                        API.sendChat(subChat(underground.chat.sessionstats, {name: from, woots: woots, mehs: mehs, grabs: grabs}));
                    }
                }
            },

            skipCommand: {
                command: 'skip',
                rank: 'bouncer',
                type: 'exact',
                functionality: function (chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void (0);
                    if (!underground.commands.executable(this.rank, chat)) return void (0);
                    else {
                        API.sendChat(subChat(underground.chat.skip, {name: chat.un}));
                        API.moderateForceSkip();
                        underground.room.skippable = false;
                        setTimeout(function () {
                            underground.room.skippable = true
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
                    if (!underground.commands.executable(this.rank, chat)) return void (0);
                    else {
                        if (underground.settings.songstats) {
                            underground.settings.songstats = !underground.settings.songstats;
                            return API.sendChat(subChat(underground.chat.toggleoff, {name: chat.un, 'function': underground.chat.songstats}));
                        }
                        else {
                            underground.settings.songstats = !underground.settings.songstats;
                            return API.sendChat(subChat(underground.chat.toggleon, {name: chat.un, 'function': underground.chat.songstats}));
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
                    if (!underground.commands.executable(this.rank, chat)) return void (0);
                    else {
                        var from = chat.un;
                        var msg = '/me [@' + from + '] ';

                        msg += underground.chat.afkremoval + ': ';
                        if (underground.settings.afkRemoval) msg += 'ON';
                        else msg += 'OFF';
                        msg += '. ';
                        msg += underground.chat.afksremoved + ": " + underground.room.afkList.length + '. ';
                        msg += underground.chat.afklimit + ': ' + underground.settings.maximumAfk + '. ';

                        msg += 'Bouncer+: ';
                        if (underground.settings.bouncerPlus) msg += 'ON';
                        else msg += 'OFF';
                        msg += '. ';

                        msg += underground.chat.blacklist + ': ';
                        if (underground.settings.blacklistEnabled) msg += 'ON';
                        else msg += 'OFF';
                        msg += '. ';

                        msg += underground.chat.lockguard + ': ';
                        if (underground.settings.lockGuard) msg += 'ON';
                        else msg += 'OFF';
                        msg += '. ';

                        msg += underground.chat.cycleguard + ': ';
                        if (underground.settings.cycleGuard) msg += 'ON';
                        else msg += 'OFF';
                        msg += '. ';

                        msg += underground.chat.timeguard + ': ';
                        if (underground.settings.timeGuard) msg += 'ON';
                        else msg += 'OFF';
                        msg += '. ';

                        msg += underground.chat.chatfilter + ': ';
                        if (underground.settings.filterChat) msg += 'ON';
                        else msg += 'OFF';
                        msg += '. ';

                        msg += underground.chat.historyskip + ': ';
                        if (underground.settings.historySkip) msg += 'ON';
                        else msg += 'OFF';
                        msg += '. ';

                        msg += underground.chat.voteskip + ': ';
                        if (underground.settings.voteSkip) msg += 'ON';
                        else msg += 'OFF';
                        msg += '. ';

                        msg += underground.chat.cmddeletion + ': ';
                        if (underground.settings.cmdDeletion) msg += 'ON';
                        else msg += 'OFF';
                        msg += '. ';

                        msg += underground.chat.autoskip + ': ';
                        if (underground.room.autoskip) msg += 'ON';
                        else msg += 'OFF';
                        msg += '. ';

                        var launchT = underground.room.roomstats.launchTime;
                        var durationOnline = Date.now() - launchT;
                        var since = underground.roomUtilities.msToStr(durationOnline);
                        var msg2 = '';
                        msg2 += subChat(underground.chat.activefor, {time: since});
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
                    if (!underground.commands.executable(this.rank, chat)) return void (0);
                    else {
                        var msg = chat.message;
                        if (msg.length === cmd.length) return API.sendChat(subChat(underground.chat.nouserspecified, {name: chat.un}));
                        var firstSpace = msg.indexOf(' ');
                        var lastSpace = msg.lastIndexOf(' ');
                        var name1 = msg.substring(cmd.length + 2, lastSpace);
                        var name2 = msg.substring(lastSpace + 2);
                        var user1 = underground.userUtilities.lookupUserName(name1);
                        var user2 = underground.userUtilities.lookupUserName(name2);
                        if (typeof user1 === 'boolean' || typeof user2 === 'boolean') return API.sendChat(subChat(underground.chat.swapinvalid, {name: chat.un}));
                        if (user1.id === underground.loggedInID || user2.id === underground.loggedInID) return API.sendChat(subChat(underground.chat.addbottowaitlist, {name: chat.un}));
                        var p1 = API.getWaitListPosition(user1.id) + 1;
                        var p2 = API.getWaitListPosition(user2.id) + 1;
                        if (p1 < 0 || p2 < 0) return API.sendChat(subChat(underground.chat.swapwlonly, {name: chat.un}));
                        API.sendChat(subChat(underground.chat.swapping, {'name1': name1, 'name2': name2}));
                        if (p1 < p2) {
                            underground.userUtilities.moveUser(user2.id, p1, false);
                            setTimeout(function (user1, p2) {
                                underground.userUtilities.moveUser(user1.id, p2, false);
                            }, 2000, user1, p2);
                        }
                        else {
                            underground.userUtilities.moveUser(user1.id, p2, false);
                            setTimeout(function (user2, p1) {
                                underground.userUtilities.moveUser(user2.id, p1, false);
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
                    if (!underground.commands.executable(this.rank, chat)) return void (0);
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
                    if (!underground.commands.executable(this.rank, chat)) return void (0);
                    else {
                        if (underground.settings.timeGuard) {
                            underground.settings.timeGuard = !underground.settings.timeGuard;
                            return API.sendChat(subChat(underground.chat.toggleoff, {name: chat.un, 'function': underground.chat.timeguard}));
                        }
                        else {
                            underground.settings.timeGuard = !underground.settings.timeGuard;
                            return API.sendChat(subChat(underground.chat.toggleon, {name: chat.un, 'function': underground.chat.timeguard}));
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
                    if (!underground.commands.executable(this.rank, chat)) return void (0);
                    else {
                        var temp = underground.settings.blacklistEnabled;
                        underground.settings.blacklistEnabled = !temp;
                        if (underground.settings.blacklistEnabled) {
                            return API.sendChat(subChat(underground.chat.toggleon, {name: chat.un, 'function': underground.chat.blacklist}));
                        }
                        else return API.sendChat(subChat(underground.chat.toggleoff, {name: chat.un, 'function': underground.chat.blacklist}));
                    }
                }
            },

            togglemotdCommand: {
                command: 'togglemotd',
                rank: 'bouncer',
                type: 'exact',
                functionality: function (chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void (0);
                    if (!underground.commands.executable(this.rank, chat)) return void (0);
                    else {
                        if (underground.settings.motdEnabled) {
                            underground.settings.motdEnabled = !underground.settings.motdEnabled;
                            API.sendChat(subChat(underground.chat.toggleoff, {name: chat.un, 'function': underground.chat.motd}));
                        }
                        else {
                            underground.settings.motdEnabled = !underground.settings.motdEnabled;
                            API.sendChat(subChat(underground.chat.toggleon, {name: chat.un, 'function': underground.chat.motd}));
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
                    if (!underground.commands.executable(this.rank, chat)) return void (0);
                    else {
                        if (underground.settings.voteSkip) {
                            underground.settings.voteSkip = !underground.settings.voteSkip;
                            API.sendChat(subChat(underground.chat.toggleoff, {name: chat.un, 'function': underground.chat.voteskip}));
                        }
                        else {
                            underground.settings.voteSkip = !underground.settings.voteSkip;
                            API.sendChat(subChat(underground.chat.toggleon, {name: chat.un, 'function': underground.chat.voteskip}));
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
                    if (!underground.commands.executable(this.rank, chat)) return void (0);
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
                                return API.sendChat(subChat(underground.chat.notbanned, {name: chat.un}));
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
                    if (!underground.commands.executable(this.rank, chat)) return void (0);
                    else {
                        underground.roomUtilities.booth.unlockBooth();
                    }
                }
            },

            unmuteCommand: {
                command: 'unmute',
                rank: 'bouncer',
                type: 'startsWith',
                functionality: function (chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void (0);
                    if (!underground.commands.executable(this.rank, chat)) return void (0);
                    else {
                        var msg = chat.message;
                        var permFrom = underground.userUtilities.getPermission(chat.uid);

                        if (msg.indexOf('@') === -1 && msg.indexOf('all') !== -1) {
                            if (permFrom > 2) {
                                underground.room.mutedUsers = [];
                                return API.sendChat(subChat(underground.chat.unmutedeveryone, {name: chat.un}));
                            }
                            else return API.sendChat(subChat(underground.chat.unmuteeveryonerank, {name: chat.un}));
                        }

                        var from = chat.un;
                        var name = msg.substr(cmd.length + 2);

                        var user = underground.userUtilities.lookupUserName(name);

                        if (typeof user === 'boolean') return API.sendChat(subChat(underground.chat.invaliduserspecified, {name: chat.un}));

                        var permUser = underground.userUtilities.getPermission(user.id);
                        if (permFrom > permUser) {

                            var muted = underground.room.mutedUsers;
                            var wasMuted = false;
                            var indexMuted = -1;
                            for (var i = 0; i < muted.length; i++) {
                                if (muted[i] === user.id) {
                                    indexMuted = i;
                                    wasMuted = true;
                                }
                            }
                            if (!wasMuted) return API.sendChat(subChat(underground.chat.notmuted, {name: chat.un}));
                            underground.room.mutedUsers.splice(indexMuted);
                            API.sendChat(subChat(underground.chat.unmuted, {name: chat.un, username: name}));

                            try {
                                API.moderateUnmuteUser(user.id);
                                API.sendChat(subChat(underground.chat.unmuted, {name: chat.un, username: name}));
                            }
                            catch (e) {
                                API.sendChat(subChat(underground.chat.notmuted, {name: chat.un}));
                            }
                        }
                        else API.sendChat(subChat(underground.chat.unmuterank, {name: chat.un}));
                    }
                }
            },

            usercmdcdCommand: {
                command: 'usercmdcd',
                rank: 'manager',
                type: 'startsWith',
                functionality: function (chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void (0);
                    if (!underground.commands.executable(this.rank, chat)) return void (0);
                    else {
                        var msg = chat.message;
                        var cd = msg.substring(cmd.length + 1);
                        if (!isNaN(cd)) {
                            underground.settings.commandCooldown = cd;
                            return API.sendChat(subChat(underground.chat.commandscd, {name: chat.un, time: underground.settings.commandCooldown}));
                        }
                        else return API.sendChat(subChat(underground.chat.invalidtime, {name: chat.un}));
                    }
                }
            },

            usercommandsCommand: {
                command: 'usercommands',
                rank: 'manager',
                type: 'exact',
                functionality: function (chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void (0);
                    if (!underground.commands.executable(this.rank, chat)) return void (0);
                    else {
                        if (underground.settings.usercommandsEnabled) {
                            API.sendChat(subChat(underground.chat.toggleoff, {name: chat.un, 'function': underground.chat.usercommands}));
                            underground.settings.usercommandsEnabled = !underground.settings.usercommandsEnabled;
                        }
                        else {
                            API.sendChat(subChat(underground.chat.toggleon, {name: chat.un, 'function': underground.chat.usercommands}));
                            underground.settings.usercommandsEnabled = !underground.settings.usercommandsEnabled;
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
                    if (!underground.commands.executable(this.rank, chat)) return void (0);
                    else {
                        var msg = chat.message;
                        if (msg.length === cmd.length) return API.sendChat(subChat(underground.chat.nouserspecified, {name: chat.un}));
                        var name = msg.substring(cmd.length + 2);
                        var user = underground.userUtilities.lookupUserName(name);
                        if (user === false) return API.sendChat(subChat(underground.chat.invaliduserspecified, {name: chat.un}));
                        var vratio = user.votes;
                        var ratio = vratio.woot / vratio.meh;
                        API.sendChat(subChat(underground.chat.voteratio, {name: chat.un, username: name, woot: vratio.woot, mehs: vratio.meh, ratio: ratio.toFixed(2)}));
                    }
                }
            },

            voteskipCommand: {
                command: 'voteskip',
                rank: 'manager',
                type: 'startsWith',
                functionality: function (chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void (0);
                    if (!underground.commands.executable(this.rank, chat)) return void (0);
                    else {
                        var msg = chat.message;
                        if (msg.length <= cmd.length + 1) return API.sendChat(subChat(underground.chat.voteskiplimit, {name: chat.un, limit: underground.settings.voteSkipLimit}));
                        var argument = msg.substring(cmd.length + 1);
                        if (!underground.settings.voteSkip) underground.settings.voteSkip = !underground.settings.voteSkip;
                        if (!isNaN(argument)) {
                            underground.settings.voteSkipLimit = argument;
                            API.sendChat(subChat(underground.chat.voteskipsetlimit, {name: chat.un, limit: underground.settings.voteSkipLimit}));
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
                    if (!underground.commands.executable(this.rank, chat)) return void (0);
                    else {
                        if (underground.settings.welcome) {
                            underground.settings.welcome = !underground.settings.welcome;
                            API.sendChat(subChat('/me Welcome Messages disabled.'));
                        }
                        else {
                            underground.settings.welcome = !underground.settings.welcome;
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
                    if (!underground.commands.executable(this.rank, chat)) return void (0);
                    else {
                        if (typeof underground.settings.website === "string")
                            API.sendChat(subChat(underground.chat.website, {link: underground.settings.website}));
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
                    API.sendChat(subChat('The open source code for ' + underground.settings.botName +  'is available at: https://github.com/Paradox68/UndergroundBot'));
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
                            if (underground.settings.spotLock === "none") {
                                API.sendChat('/me ' + chat.un + ' has locked their spot at position 1 in the queue!');
                                underground.settings.spotLock = chat.un;
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
                        if (!underground.room.numberG.active) { return void (0); }
                        var gn = chat.message.substring(cmd.length + 1);
                        var gni = parseInt(gn);
                        if (gni === underground.room.numberG.currentNumber || gn === underground.room.numberG.currentNumber.toString()) {
                            underground.room.numberG.endNumberGame(chat.uid);
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
                        if (!underground.commands.executable(this.rank, chat)) { return void (0); }
                        if (chat.message.length < 6) { return void (0); }
                        var gn = chat.message.substring(cmd.length + 1);
                        var gni = parseInt(gn);
                        underground.room.numberG.difficulty = gni;
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

                gibmeCommand: {
                    command: 'gib',
                    rank: 'bouncer',
                    type: 'startsWith',
                    functionality: function (chat, cmd) {
                        if (!underground.commands.executable(this.rank, chat)) { return void (0); }
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
                        var user = underground.userUtilities.lookupUserName(name);
                        underground.room.cash.updateUserCurrency(user.id, amt);
                        API.sendChat('/me ' + chat.un + ' has given ' + name + ' ' + amt + ' monies.');
                    }
                },

                balanceCommand: {
                    command: 'balance',
                    rank: 'user',
                    type: 'exact',
                    functionality: function (chat, cmd) {
                        if (!underground.commands.executable(this.rank, chat)) { return void (0); }
                        if (typeof underground.settings.monies[chat.uid] !== 'undefined') {
                            API.sendChat(chat.un + ' has a balance of ' + underground.settings.monies[chat.uid] + ' UGold.');
                        } else {
                            API.sendChat(chat.un + ' has no UGold.');
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
                        if (!underground.room.dicegame.dgStatus) { return void (0); }
                        if (underground.room.dicegame.participants.indexOf(chat.uid) >= 0) { return void (0); }
                        var num = Math.floor((Math.random() * 999) + 1);
                        var nts = num.toString();

                        underground.room.dicegame.participants.push(chat.uid);
                        if (num > underground.room.dicegame.highestRoll) {
                            underground.room.dicegame.highestRollerID = "undefined";
                            underground.room.dicegame.highestRoll = 0;
                            underground.room.dicegame.winning = "nobody";
                            this.countdown = setTimeout(function () {
                                API.sendChat('/me ' + chat.un + ' has rolled ' + nts + ' and is now winning the Dice Game');
                                underground.room.dicegame.highestRoll = num;
                                underground.room.dicegame.winning = chat.un;
                                underground.room.dicegame.highestRollerID = chat.uid;
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
                        API.sendChat(subChat('http://i.imgur.com/rbFPzbB.webm'));
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
                        if (!underground.commands.executable(this.rank, chat)) { return void (0); }
                        underground.room.numberG.playNumberGame();
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
                        if (!underground.commands.executable(this.rank, chat)) return void (0);
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
                                    underground.settings.approvedDJ = otherid;
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
                        if (!underground.commands.executable(this.rank, chat)) return void (0);
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
                        if (!underground.commands.executable(this.rank, chat)) return void (0);
                        else {
                            var msg = chat.message;
                            var id = chat.uid;
                            var sOnline = 0;
                            users = API.getUsers();
                            var len = users.length;
                            for (var i = 0; i < len; ++i){
                                if (underground.userUtilities.getPermission(users[i].id) > 1){
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
                        if (!underground.commands.executable(this.rank, chat)) return void (0);
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

                                    API.sendChat(subChat(underground.chat.whois, {name1: chat.un, name2: name, id: id, avatar: avatar, profile: profile, language: language, level: level, status: status, joined: joined, rank: rank}));
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
                        if (!underground.commands.executable(this.rank, chat)) return void (0);
                        else {
                            if (typeof underground.settings.youtubeLink === "string")
                                API.sendChat(subChat(underground.chat.youtube, {name: chat.un, link: underground.settings.youtubeLink}));
                        }
                    }
                }
            }
        };

    loadChat(underground.startup);
}).call(this);
