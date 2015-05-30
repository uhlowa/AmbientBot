Commands:
=========

X specifies a number  
Arguments between ( ) are optional


Images
----
|Command |
|:------:|
|!hello, !hi, !hey |
|!dance - !dance13 |
|!faggot - !faggot6 |
|!regret |
|!fuckyou - !fuckyou10 |
|!james |
|!bug |
|!penis |
|!idgaf |
|!allowit |
|!refresh |
|!fuckthis |
|!shutup |
|!hilarious |
|!gloryhole |
|!bad - !bad4 |
|!feelbad |
|!clap - !clap1 |
|!brofist |
|!hangyourself |
|!laugh - !laugh2 |
|!flirt - !flirt7 |
|!sad |
|!djdoge |
|!rodge |
|!noregrets |
|!thefuck |
|!good |
|!no |
|!why - !why1 |
|!wiggle - !wiggle3 |
|!brohug |
|!bye |


User
----

|Command | Arguments |  Description |
|:------:|:---------:|:--------------------------------------:|
|!8ball | (message) | ask the bot a question, the bot will return random variations of a yes or no answer. |
|!autowoot | | links to PlugCubed, the advised script/plugin to use for autowooting |
|!ba | | explains the Brand Ambassador rank |
|!commands | | gives a link to the commands |
|!cookie | (@user) | give a cookie to user |
|!dclookup / !dc | | use dclookup on yourself |
|!emoji | | a link to a list with emoji's |
|!eta | | shows how long before you reach the booth |
|!fb | | links to the room's Facebook page (if set in the settings) |
|!ghostbuster | @user | checks if user is ghosting |
|!gif | (message) | returns gif (from giphy) related to the tag provided. Returns a random gif if no tags are provided. |
|!guess | (int) | Guess a number for the Number Guessing game |
|!help | | links to an image to help get people started on plug |
|!join | | join the Raffle if it's up |
|!leave | | leave the Raffle if you joined |
|!link | | when the user is the DJ, give a link to the current song |
|!lockpos | | Lock your position in the queue during a raffle |
|!nextraffle | | Returns how many minutes until the next Auto raffle |
|!op | | links to the OverPlayed list (if set in the settings) |
|!ping | | pong! |
|!purchase | | returns link to purchase more plug notes |
|!roll | | Roll an integer 1-999 during a Dice Game |
|!rules | | links to the rules (if set in the settings) |
|!staffon | | Returns how many staff members are online |
|!theme | | links to the room's theme (if set in the settings) |
|!website | | links to the room's website (if set in the settings) |
|!youtube | | links to the room's youtube page (if set in the settings) |


Resident DJ
-----------

|Command | Arguments |  Description |
|:------:|:---------:|:--------------------------------------:|
|!link | | give a link to the current song

Bouncer
-------

|Command | Arguments |  Description |
|:------:|:---------:|:--------------------------------------:|
|!active | (X) | shows how many users chatted in the past X minutes. If no X specified, 60 is set as default |
|!afkreset | @user | resets the afk time of user |
|!afktime | @user | shows how long user has been afk |
|!approve | @user | Approve a users next track |
|!autodisable | | toggle the autodisable |
|!ban | @user | bans user for 1 day |
|!blacklist / !bl | blacklistname | add the song to the specified blacklist |
|!blinfo | | get information required to blacklist a song |
|!cycleguard | | toggles the cycleguard |
|!dclookup / !dc | (@user) | do dclookup for user |
|!english | @user | ask user to speak english (asked in the language they set plug to) |
|!eta | (@user) | shows when user will reach the booth |
|!filter | | toggles the chat filter |
|!jointime | @user | shows how long the user has been in the room |
|!kick | (X) | kicks user for X minutes, default is 0.25 minutes (15 seconds) |
|!kill | | shut down the bot |
|!lockguard | | toggle the lockguard |
|!lockskip | (reason) | skip the song and move the dj back up (the position can be set with !lockskippos) |
|!lockskippos | X | set the position to which lockskip moves the dj |
|!motd | (X)/(message) | when no argument is specified, returns the Message of the Day, when X is specified, the MotD is given every X songs, when "message" is given, it sets the MotD to message |
|!mute | @user (X) | mute user, for X minutes if X is specified, otherwise for an undefined period |
|!opinion | @user | Their opinion no longer matters |
|!reload | | reload the bot |
|!restricteta | | toggles the restriction on eta: grey users can use it once an hour |
|!sessionstats | | display stats for the current session |
|!skip | | skip the current song |
|!status | | display the bot's status and some settings |
|!timeguard | | toggle the timeguard |
|!togglebl | | toggle the blacklist |
|!togglemotd | | toggle the motd |
|!togglevoteskip | | toggle the voteskip |
|!unban | @user | unban user |
|!unmute | | unmute user |
|!voteratio | @user | display the vote statistic for a user |
|!whois | @user | returns plug related information about user |

Bouncer+
--------

|Command | Arguments |  Description |
|:------:|:---------:|:--------------------------------------:|
|!add | @user | add user to the waitlist |
|!afkremoval | | toggles the afk check |
|!autoskip | | skips songs automatically when they're done (use when the circles-bug happens) |
|!bouncer+ | | disable bouncer+ |
|~~!deletechat~~ | ~~@user~~ | ~~delete all the chats by a certain user~~ |
|!dicegame | | Start a round of the Dice Rolling game |
|!diff | 1, 2, or 3 | Change the difficulty of the Number Guessing game |
|!lock | | lock the waitlist |
|!lockdown | | lock down the room: only staff can chat |
|!maxlength | X | specify the maximum length a song can be when timeguard is enabled |
|!move | @user (X) | moves user to position X on the waitlist, default is position 1 |
|!playnumber | | Start a game of Number Guessing. |
|!remove | @user | remove user from the waitlist |
|!roulette | | start a roulette |
|!songstats | | toggle song statistics |
|!unlock | | unlock the waitlist |
|!welcome | | toggle the welcome message on user join |

Manager
-------

|Command | Arguments |  Description |
|:------:|:---------:|:--------------------------------------:|
|!afklimit | X | sets the maximum afk time |
|!botname | (botname) | change the default bot name |
|!bouncer+ | |Set bouncer+ rank to true or false |
|!clearchat | |clears the chat |
|!cycle | | toggle DJ cycle |
|!cycletimer | X | set the maximum DJ cycle time for when cycleguard is enabled |
|!language | (language) | specify the language you would like the bot to use |
|!locktimer | X | set the maximum time the waitlist can be locked if lockguard is enabled |
|!usercmdcd | X | set the cooldown on commands by grey users |
|!usercommands | | toggle user commands |
|!voteskip | (X) | when no argument is specified, returns the current voteskip limit, when X is specified, voteskip limit is updated to the new specified limit. |
