#pragma strict
#pragma downcast

private var gameManager : GameObject;
private var menuScript : Menu;
private var playerScript : PlayerScript;
private var gameSetupScript : GameSetupScript;
private var netScript : Net;

private var showMenu : boolean = false;
private var isHosting : boolean = false;
private var isStartingServer : boolean = false;
private var gameName : String;
private var playerLimit : int = 4;
public var selectCharacter : boolean = false;
private var showStatusBar : boolean = false;
private var isVersus : GameMode = GameMode.Team;


private var guiHost : GuiClasses[];
private var guiObject : GuiClasses [];
private var guiNewGame: GuiClasses [];
private var guiVersus:GuiClasses[];
private var guiOverlays : GuiClasses[];

private var playerTexture : Texture2D;
private var playerSelfTexture : Texture2D;
private var commanderTexture : Texture2D;
private var homeTexture : Texture2D;
private var backgroundTexutre : Texture2D;
private var createNewOverlayTexture : Texture2D;
private var backTexture : Texture2D;
private var readyCheckMarkTexture : Texture2D;
private var statusBarTexture : Texture2D;
private var arrowTexture : Texture2D;
private var arrowDownTexture : Texture2D;
private var arrowTextureDisabled : Texture2D;
private var arrowDownTextureDisabled : Texture2D;
private var whiteBarTexture : Texture2D;

private var runnerSelectionTexture :Texture2D;
private var commnaderSelectionTexture : Texture2D;
private var teamOneOverlay : Texture2D;
private var teamTwoOverlay : Texture2D;

private var selectedPlayerIndex : int = 0;
private var playerTextures :Texture[ ] = new Texture[13];
private var playerSelfTextures :Texture[ ] = new Texture[13];

private var menuSkin : GUISkin;

private var headerText = 60;
private var bodyText = 50;
private var buttonText = 35;

private var player : Runner;

private var tmpColor : Color;
//TODO: Remove and put somewhere else.
private var charactersNames : String[] = ["Diane","Ruth","Luke", "Sarah", "Dan", "Ben", "Rachel", "Lauren", "Bill", "Maddy", "Bradley", "Daisy"];

public var playerList : Dictionary.<String,Player>;
public var playerwoTeamList : Dictionary.<String,Player>;
public var selectedCharacters : List.<int>;
public var teamList : List.<Team>;

private var teamOneFull : boolean = false;
private var teamTwoFull : boolean = false;

private var localStyle :GUIStyle;
private var headerStyle :GUIStyle;
private var greenStyle :GUIStyle;
private var yellowStyle :GUIStyle;
private var whiteText :GUIStyle;
private var blackText :GUIStyle;
private var disabledStyle : GUIStyle;
private var blackBoldText : GUIStyle;


function Awake() {
    netScript = GetComponent(Net);
}

function Start() {
    menuScript = Menu.script;
    gameManager = GameObject.Find("/GameManager");

    playerScript = gameManager.GetComponent(PlayerScript);
    gameSetupScript = gameManager.GetComponent(GameSetupScript);

    //persist game manager object between scenes
    DontDestroyOnLoad(gameManager);

    menuSkin = Resources.Load("MenuSkin", GUISkin);
    backTexture = Resources.Load("Textures/gui/back", Texture2D);
    playerTexture = Resources.Load("Textures/gui/player", Texture2D);
    homeTexture = Resources.Load("Textures/gui/home", Texture2D);
    backgroundTexutre = Resources.Load("Textures/gui/mainMenuBackground", Texture2D);
    createNewOverlayTexture = Resources.Load("Textures/gui/createNewOverlay", Texture2D);
    readyCheckMarkTexture = Resources.Load("Textures/gui/readyCheckMark", Texture2D);
    statusBarTexture = Resources.Load("Textures/gui/statusBar", Texture2D);
    arrowTexture = Resources.Load("Textures/gui/arrow", Texture2D);
    arrowDownTexture = Resources.Load("Textures/gui/arrowDown", Texture2D);
    arrowTextureDisabled = Resources.Load("Textures/gui/arrowFaded", Texture2D);
    arrowDownTextureDisabled = Resources.Load("Textures/gui/arrowDownFaded", Texture2D);
    whiteBarTexture = Resources.Load("Textures/gui/whiteBar", Texture2D);

    runnerSelectionTexture =  Resources.Load("Textures/gui/runnerOverlay", Texture2D);
    commnaderSelectionTexture =  Resources.Load("Textures/gui/commanderOverlay", Texture2D);
    teamOneOverlay =  Resources.Load("Textures/gui/purpleOverlay", Texture2D);
    teamTwoOverlay = Resources.Load("Textures/gui/blueOverlay", Texture2D);

    guiHost = new GuiClasses[5];
    for (var x = 0; x < guiHost.length; x++) {
        guiHost[x] = new GuiClasses();
    }

    guiObject = new GuiClasses[2];
    for (var y = 0; y < guiObject.length; y++) {
        guiObject[y] = new GuiClasses();
    }

    guiNewGame = new GuiClasses[5];
    for (var z = 0; z < guiNewGame.length; z++) {
        guiNewGame[z] = new GuiClasses();
    }

    guiVersus = new GuiClasses[5];
    for (var w = 0; w < guiVersus.length; w++) {
        guiVersus[w] = new GuiClasses();
    }

    guiOverlays = new GuiClasses[3];
    for (var v = 0; v < guiOverlays.length; v++) {
        guiOverlays[v] = new GuiClasses();
    }

    for (var i = 0; i < 13; i++) {
        if (i < 9) {
            playerTexture = Resources.Load("Textures/gui/player" + i, Texture2D);
            playerSelfTexture = Resources.Load("Textures/gui/player" + i + "_self", Texture2D);
        } else if (i < 12) {
            playerTexture = Resources.Load("Textures/gui/commander" + i, Texture2D);
            playerSelfTexture = Resources.Load("Textures/gui/commander" + i + "_self", Texture2D);
        } else {
            playerTexture = Resources.Load("Textures/gui/player_empty", Texture2D);
            playerSelfTexture = Resources.Load("Textures/gui/player_empty_self", Texture2D);
        }
        playerTextures[i] = playerTexture;
        playerSelfTextures[i] = playerSelfTexture;
    }

}


function OnGUI() {

    if (!showMenu) {
        return;
    }

    GUI.skin = menuSkin;

    GUI.DrawTexture(new Rect(0, 0, Screen.width, Screen.height), backgroundTexutre);

    if (showStatusBar) {
        GUI.DrawTexture(new Rect(0, Screen.height - 100 * menuScript.getScale(), Screen.width, 100 * menuScript.getScale()), statusBarTexture);
        GUI.Label(new Rect(0,  Screen.height - 100 * menuScript.getScale(), Screen.width, 100 * menuScript.getScale()), gameSetupScript.game.getGameStatus(), "WhiteText");
    }

    setUpStyles();

    //Home Btn
      //Back Button
    guiObject[1].textureWidth = Screen.width * 0.08;
    guiObject[1].textureHeight = Screen.height * 0.15;
    guiObject[1].setLocation(Points.TopLeft);

    if (GUI.Button(Rect(Screen.width - Screen.width * 0.09, guiObject[1].offset.y + Screen.height * 0.02, guiObject[1].textureWidth,  guiObject[1].textureHeight), "", "HomeButton")) {
        Util.playTap();
        selectCharacter = false;

        if (isHosting && Network.isServer){
           netScript.killGame();
        } else if(Network.isClient) {
            //remove player
           gameManager.networkView.RPC("removePlayer", RPCMode.All, Network.player);
        }

        leaveFor(menus.lobby);
    }

    /* ---------- CREATE NEW GAME SCREEN ---------- */
    if (isHosting && !Network.isServer) {
        //GUI.Label(new Rect(0, Screen.height / 2 - Screen.height / 2.5, Screen.width, 0), "NEW GAME", "Header");

        guiNewGame[0].textureWidth = Screen.width;
        guiNewGame[0].textureHeight = 100;
        guiNewGame[0].setLocation(Points.Center);

        guiNewGame[1].textureWidth = Screen.width / 2.2;
        guiNewGame[1].textureHeight = menuScript.getScale() * 100;
        guiNewGame[1].setLocation(Points.Center);

        guiNewGame[2].textureWidth = Screen.width / 5.5;
        guiNewGame[2].textureHeight = Screen.height / 10;
        guiNewGame[2].setLocation(Points.Center);

        guiNewGame[3].textureWidth = Screen.width / 1.5;
        guiNewGame[3].textureHeight = Screen.height / 3;
        guiNewGame[3].setLocation(Points.Center);

        GUI.DrawTexture(new Rect(guiNewGame[3].offset.x, guiNewGame[3].offset.y, Screen.width / 1.5, Screen.height / 3), createNewOverlayTexture);

        GUI.Label(Rect(guiNewGame[0].offset.x, guiNewGame[0].offset.y - Screen.height / 12, Screen.width, 100), "Game Name", "PlainText");
        gameName = GUI.TextField(Rect(guiNewGame[1].offset.x, guiNewGame[1].offset.y + Screen.height/22, Screen.width / 2.2, menuScript.getScale() * 100), gameName, 15);

        if(gameName) {
            GUI.DrawTexture(new Rect(0, Screen.height - 100 * menuScript.getScale(), Screen.width, 100 * menuScript.getScale()), statusBarTexture);
            GUI.Label(new Rect(0,  Screen.height - 100 * menuScript.getScale(), Screen.width, 100 * menuScript.getScale()), "Tap to Continue", "WhiteText");
        }

        if (gameName && GUI.Button(Rect(0, 0, Screen.width, Screen.height), "", "FullImage")) {
            Util.playTap();
            netScript.startHost(Config.TEAM_SIZE, gameName, onServerInitialize);
            isStartingServer = true;
        }
    }

    /* ---------- STARTING SERVER LOAD SCREEN ---------- */
    else if (isStartingServer) {
        guiNewGame[4].textureWidth = Screen.width / 1.5;
        guiNewGame[4].textureHeight = Screen.height / 1.5;
        guiNewGame[4].setLocation(Points.Center);

        GUI.DrawTexture(new Rect(guiNewGame[4].offset.x, guiNewGame[4].offset.y, Screen.width / 1.5, Screen.height / 1.5), createNewOverlayTexture);
        GUI.Label(Rect(0, 0, Screen.width, Screen.height), "Starting server. Please Wait...", "PlainText");
    }

    /* ---------- PLAYER LOBBY SCREEN ---------- */
    else if (Network.isClient || (isHosting && Network.isServer)) {

        showStatusBar = true;
        playerList = gameSetupScript.game.getPlayers();

        var teamCount: int = playerList.Count;
        checkVersus(teamCount);
        teamList = gameSetupScript.game.getTeams();

        for (var n = 0; n < 2; n++) {
            guiObject[n].textureWidth = Screen.width * 0.06;
            guiObject[n].textureHeight = Screen.height * 0.1;
        }

        if (selectCharacter == false) {

            guiHost[1].textureWidth = Screen.width * 0.15;
            guiHost[1].textureHeight = Screen.height * 0.2;
            guiHost[1].setLocation(Points.Center);

            var currentTeamCount: int = 0;
            var showEmpty: boolean = false;
            var playerCount = 0;
            var layoutOffset = 0;
            var cPlayer: Player;

            if (isVersus == GameMode.Team) {
                for (var d = 0; d < Config.MAX_TEAM_COUNT; d++) {

                    currentTeamCount = d;

                    if (currentTeamCount > teamCount - 1) {
                        showEmpty = true;
                        currentTeamCount = 12;
                    } else {
                        cPlayer = playerList[playerList.Keys.ToList()[d]];
                        if(cPlayer.getTeamId() == 100) cPlayer.setTeam(0, gameSetupScript.game.getTeam(0));

                    }
                    //Layout of the players squares
                    switch (playerCount) {
                    case 0:
                        layoutOffset = (-2) * guiHost[1].textureWidth;
                        break;
                    case 1:
                        layoutOffset = (-1) * guiHost[1].textureWidth;
                        break;
                    case 2:
                        layoutOffset = 0;
                        break;
                    case 3:
                        layoutOffset = (1) * guiHost[1].textureWidth;
                        break;
                    case 4:
                        layoutOffset = (2) * guiHost[1].textureWidth;
                        break;
                    }

                    if (showEmpty) {
                        GUI.Button(Rect(guiHost[1].offset.x + layoutOffset, guiHost[1].offset.y, Screen.width * 0.15, Screen.height * 0.20), playerTextures[currentTeamCount], "FullImage");
                    } else if (!showEmpty) {
                        if (Util.IsNetworkedPlayerMe(cPlayer)) {
                            if (GUI.Button(Rect(guiHost[1].offset.x + layoutOffset, guiHost[1].offset.y, Screen.width * 0.15, Screen.height * 0.20), playerSelfTextures[cPlayer.getCharacter()], "FullImage")) {
                                Util.playTap();
                                selectCharacter = true;
                            }
                        } else {
                            GUI.Button(Rect(guiHost[1].offset.x + layoutOffset, guiHost[1].offset.y, Screen.width * 0.15, Screen.height * 0.20), playerTextures[cPlayer.getCharacter()], "FullImage");
                        }

                        GUI.Label(Rect(guiHost[1].offset.x + layoutOffset, guiHost[1].offset.y + Screen.height * 0.2 - 15, Screen.width * 0.15, Screen.height * 0.20), cPlayer.getName(), "WhiteText");

                        if (cPlayer.getReadyStatus()) {
                            GUI.Button(Rect(guiHost[1].offset.x + layoutOffset + guiHost[1].textureWidth / 2 + 10, guiHost[1].offset.y - guiHost[1].textureHeight / 6, menuScript.getScale() * 135, menuScript.getScale() * 105), readyCheckMarkTexture, "FullImage");
                        }
                    }
                    ++playerCount;
                }

            } else {

                guiVersus[2].textureWidth = Screen.width * 0.09;
                guiVersus[2].textureHeight = Screen.height * 0.12;
                guiVersus[2].setLocation(Points.Center);

                guiVersus[3].textureWidth = Screen.width * 0.13;
                guiVersus[3].textureHeight = Screen.height * 0.18;
                guiVersus[3].setLocation(Points.Center);

                guiVersus[4].textureWidth = Screen.width * 0.1;
                guiVersus[4].textureHeight = Screen.height * 0.05;
                guiVersus[4].setLocation(Points.Center);

                var leftLayoutCount = 0;
                var rightLayoutCount = 0;


                guiOverlays[2].textureWidth = Screen.width /1.5;
                guiOverlays[2].textureHeight = Screen.height / 4;
                guiOverlays[2].setLocation(Points.Center);

                GUI.DrawTexture(new Rect(guiOverlays[2].offset.x, guiOverlays[2].offset.y - Screen.height * 0.073 - guiOverlays[2].offset.y / 1.4, guiOverlays[2].textureWidth, guiOverlays[2].textureHeight), teamOneOverlay);
                GUI.DrawTexture(new Rect(guiOverlays[2].offset.x, guiOverlays[2].offset.y - Screen.height * 0.03 + guiOverlays[2].offset.y / 1.4, guiOverlays[2].textureWidth, guiOverlays[2].textureHeight), teamTwoOverlay);

                //Need to check to see if team is full, so if teamCount is full, show faded arrow
                // if team is full, set teamOneFull - teamTwoFull to true...
                if (teamList[0].getTeammates().Count == 5) teamOneFull = true;
                else teamOneFull = false;

                if (teamList[1].getTeammates().Count == 5) teamTwoFull = true;
                else teamTwoFull = false;

                switchingTeams();

                playerwoTeamList = gameSetupScript.game.getPlayerswoTeam();

                var playerWOTeamCount = playerwoTeamList.Count;

                //Team 1
                var teamOneShowEmpty: boolean = false;
                var teamOneCount: int = 0;
                var teamOneMates: Dictionary. < String, Player > = teamList[0].getTeammates();

                for (var a = 0; a < Config.MAX_TEAM_COUNT; a++) {

                    teamOneCount = a;

                    if (teamOneCount > teamList[0].getTeammates().Count - 1) {
                        teamOneShowEmpty = true;
                        teamOneCount = 12;
                    } else {
                        cPlayer = teamOneMates[teamOneMates.Keys.ToList()[a]];
                    }

                    switch (a) {
                    case 0:
                        layoutOffset = (-2) * guiVersus[3].textureWidth;
                        break;
                    case 1:
                        layoutOffset = (-1) * guiVersus[3].textureWidth;
                        break;
                    case 2:
                        layoutOffset = 0;
                        break;
                    case 3:
                        layoutOffset = (1) * guiVersus[3].textureWidth;
                        break;
                    case 4:
                        layoutOffset = (2) * guiVersus[3].textureWidth;
                        break;
                    }

                    if (teamOneShowEmpty) {
                        GUI.Button(Rect(guiVersus[3].offset.x + layoutOffset, guiVersus[3].offset.y - Screen.height * 0.05 - guiVersus[3].offset.y / 1.4, guiVersus[3].textureWidth, guiVersus[3].textureHeight), playerTextures[teamOneCount], "FullImage");
                    } else if (!teamOneShowEmpty) {

                        if (Util.IsNetworkedPlayerMe(cPlayer)) {
                            if (GUI.Button(Rect(guiVersus[3].offset.x + layoutOffset, guiVersus[3].offset.y - Screen.height * 0.05 - guiVersus[3].offset.y / 1.4, guiVersus[3].textureWidth, guiVersus[3].textureHeight), playerSelfTextures[cPlayer.getCharacter()], "FullImage")) {
                                selectCharacter = true;
                                Util.playTap();
                            }
                        } else {
                            GUI.Button(Rect(guiVersus[3].offset.x + layoutOffset, guiVersus[3].offset.y - Screen.height * 0.05 - guiVersus[3].offset.y / 1.4, guiVersus[3].textureWidth, guiVersus[3].textureHeight), playerTextures[cPlayer.getCharacter()], "FullImage");
                        }

                        GUI.Label(Rect(guiVersus[3].offset.x + layoutOffset - 10, guiHost[3].offset.y + Screen.height * 0.2 - 5, Screen.width * 0.15, Screen.height * 0.20), cPlayer.getName(), "WhiteText");

                        if (cPlayer.getReadyStatus()) {
                            GUI.Button(Rect(guiVersus[3].offset.x + layoutOffset + guiHost[1].textureWidth / 2, guiVersus[3].offset.y - Screen.height * 0.05 - guiVersus[3].offset.y / 1.28, menuScript.getScale() * 135, menuScript.getScale() * 105), readyCheckMarkTexture, "FullImage");
                        }

                    }
                }

                //Team 2
                var teamTwoShowEmpty: boolean = false;
                var teamTwoCount: int = 0;
                var teamTwoMates: Dictionary. < String, Player > = teamList[1].getTeammates();

                for (var b = 0; b < Config.MAX_TEAM_COUNT; b++) {

                    teamTwoCount = b;

                    if (teamTwoCount > teamList[1].getTeammates().Count - 1) {
                        teamTwoShowEmpty = true;
                        teamOneCount = 12;
                    } else {
                        cPlayer = teamTwoMates[teamTwoMates.Keys.ToList()[b]];
                    }
                    switch (b) {
                    case 0:
                        layoutOffset = (-2) * guiVersus[3].textureWidth;
                        break;
                    case 1:
                        layoutOffset = (-1) * guiVersus[3].textureWidth;
                        break;
                    case 2:
                        layoutOffset = 0;
                        break;
                    case 3:
                        layoutOffset = (1) * guiVersus[3].textureWidth;
                        break;
                    case 4:
                        layoutOffset = (2) * guiVersus[3].textureWidth;
                        break;
                    }

                    if (teamTwoShowEmpty) {
                        GUI.Button(Rect(guiVersus[3].offset.x + layoutOffset, guiVersus[3].offset.y - Screen.height * 0.05 + guiVersus[3].offset.y / 1.4, guiVersus[3].textureWidth, guiVersus[3].textureHeight), playerTextures[12], "FullImage");
                    } else if (!teamTwoShowEmpty) {
                     if (Util.IsNetworkedPlayerMe(cPlayer)) {
                            if (GUI.Button(Rect(guiVersus[3].offset.x + layoutOffset, guiVersus[3].offset.y - Screen.height * 0.05 + guiVersus[3].offset.y / 1.4, guiVersus[3].textureWidth, guiVersus[3].textureHeight), playerSelfTextures[cPlayer.getCharacter()], "FullImage")) {
                                selectCharacter = true;
                                Util.playTap();
                            }
                        } else {
                            GUI.Button(Rect(guiVersus[3].offset.x + layoutOffset, guiVersus[3].offset.y - Screen.height * 0.05 + guiVersus[3].offset.y / 1.4, guiVersus[3].textureWidth, guiVersus[3].textureHeight), playerTextures[cPlayer.getCharacter()], "FullImage");
                        }

                        GUI.Label(Rect(guiVersus[3].offset.x + layoutOffset - 10, guiHost[3].offset.y + (2 * guiVersus[3].offset.y / 1.4) + Screen.height * 0.2 - 5, Screen.width * 0.15, Screen.height * 0.20), cPlayer.getName(), "WhiteText");

                        if (cPlayer.getReadyStatus()) {
                            GUI.Button(Rect(guiVersus[3].offset.x + layoutOffset + guiHost[1].textureWidth / 2, guiVersus[3].offset.y + (2 * guiVersus[3].offset.y / 1.4) - Screen.height * 0.05 - guiVersus[3].offset.y / 1.28, menuScript.getScale() * 135, menuScript.getScale() * 105), readyCheckMarkTexture, "FullImage");
                        }

                    }
                }

                //Middle - go through all the players and list the ones not assigned to a team
                for (var e = 0; e < playerWOTeamCount; e++) {

                    cPlayer = playerwoTeamList[playerwoTeamList.Keys.ToList()[e]];

                    if (cPlayer.getTeamId() == 100 || cPlayer.getTeamId() == null) {

                        if (playerWOTeamCount % 2 == 1) {
                            if (e == 0) {
                                layoutOffset = 0;
                            } else if (e % 2 == 1) {
                                leftLayoutCount++;
                                layoutOffset = leftLayoutCount * guiVersus[2].textureWidth;
                            } else {
                                rightLayoutCount++;
                                layoutOffset = (-rightLayoutCount) * guiVersus[2].textureWidth;
                            }

                            GUI.Button(Rect(guiVersus[2].offset.x + layoutOffset, guiVersus[2].offset.y - Screen.height * 0.05, guiVersus[2].textureWidth, guiVersus[2].textureHeight), (Util.IsNetworkedPlayerMe(cPlayer) ? playerSelfTextures[cPlayer.getCharacter()] : playerTextures[cPlayer.getCharacter()]), "FullImage");

                        } else {
                            if (e % 2 == 1) {
                                leftLayoutCount++;
                                if (leftLayoutCount == 1) {
                                    layoutOffset = leftLayoutCount * guiVersus[2].textureWidth / 2;
                                } else layoutOffset = leftLayoutCount * guiVersus[2].textureWidth - guiVersus[2].textureWidth / 2;

                            } else {
                                rightLayoutCount++;

                                if (rightLayoutCount == 1) {
                                    layoutOffset = (-rightLayoutCount) * guiVersus[2].textureWidth / 2;
                                } else layoutOffset = (-rightLayoutCount) * guiVersus[2].textureWidth + guiVersus[2].textureWidth / 2;
                            }

                            GUI.Button(Rect(guiVersus[2].offset.x + layoutOffset, guiVersus[2].offset.y - Screen.height * 0.05, guiVersus[2].textureWidth, guiVersus[2].textureHeight), (Util.IsNetworkedPlayerMe(cPlayer) ? playerSelfTextures[cPlayer.getCharacter()] : playerTextures[cPlayer.getCharacter()]), "FullImage");
                        }
                    }
                }
            }

            guiHost[2].textureWidth = Screen.width * 0.17;
            guiHost[2].textureHeight = Screen.height * 0.14;
            guiHost[2].setLocation(Points.BottomRight);

            // note - isValid call updates game status message
            var isValid : boolean = gameSetupScript.game.isValid();
            if (isHosting) {
                if(isValid){
                    if (GUI.Button(Rect(guiHost[2].offset.x, Screen.height - Screen.height * 0.13 - (100 * menuScript.getScale()), guiHost[2].textureWidth, guiHost[2].textureHeight), "START", "GreenButton")) {
                        netScript.hideGame(gameName);
                        Util.playTap();
                        gameSetupScript.enterGame();
                    }
                } else {
                    GUI.Button(Rect(guiHost[2].offset.x, Screen.height - Screen.height * 0.13 - (100 * menuScript.getScale()), guiHost[2].textureWidth, guiHost[2].textureHeight), "START", "DisabledButton");
                }

            } else {
                if(playerScript.getSelf().getTeamId() != 100 && playerScript.getSelf().getCharacter() != 12) {
                    if (GUI.Button(Rect(guiHost[2].offset.x, Screen.height - Screen.height * 0.13 - (100 * menuScript.getScale()), guiHost[2].textureWidth, guiHost[2].textureHeight), (playerScript.getSelf().getReadyStatus() ? "NOT READY" : "READY"), (playerScript.getSelf().getReadyStatus() ? "YellowButton" : "GreenButton"))) {
                        Util.playTap();
                        if (playerScript.getSelf().getReadyStatus()) playerScript.getSelf().updateReadyStatus(false);
                        else playerScript.getSelf().updateReadyStatus(true);
                        gameManager.networkView.RPC("updateReadyStatus", RPCMode.All, playerScript.getSelf().getId(), playerScript.getSelf().getReadyStatus());

                    }
                } else {
                    GUI.Button(Rect(guiHost[2].offset.x, Screen.height - Screen.height * 0.13 - (100 * menuScript.getScale()), guiHost[2].textureWidth, guiHost[2].textureHeight), (playerScript.getSelf().getReadyStatus() ? "NOT READY" : "READY"), "DisabledButton");
                }
            }
        }

        else {
            /* ----------  CHARACTER SELECTION SCREEN ---------- */
            characterSelection();
        }

    }
}

function onServerInitialize(success: boolean) {
    if (success) {
        gameSetupScript.game.setName(gameName);
        isStartingServer = false;
        gameSetupScript.registerPlayerProxy(playerScript.getName());
    }
}

function enter(isNew: boolean) {
    showMenu = true;
    isHosting = isNew;

    if(gameSetupScript && gameSetupScript.game != null){
        gameSetupScript.game = new Game();
    }

    if(isHosting){
        if(gameSetupScript && gameSetupScript.game != null && gameSetupScript.game.getName() != ""){
            gameName = gameSetupScript.game.getName();
        }
        else{
            gameName = playerScript.getName() + "'s Game";
        }
    }

    if (Network.isClient) {
        gameSetupScript.registerPlayerProxy(playerScript.getName());
    }
}

function leaveFor(newMenu: menus) {
    showMenu = false;
    menuScript.stateScript.setCurrentMenu(newMenu);
    Network.Disconnect();
    menuScript.open();
}

function characterSelection() {

    showStatusBar = false;

    //Back Btn
    guiObject[0].setLocation(Points.TopLeft);

    guiOverlays[0].textureWidth = Screen.width / 2;
    guiOverlays[0].textureHeight = Screen.height / 1.1;
    guiOverlays[0].setLocation(Points.Center);

    guiOverlays[1].textureWidth = Screen.width / 5;
    guiOverlays[1].textureHeight = Screen.height / 1.1;
    guiOverlays[1].setLocation(Points.Center);

    GUI.DrawTexture(new Rect(guiOverlays[0].offset.x - (Screen.width * 0.12), guiOverlays[0].offset.y, guiOverlays[0].textureWidth, guiOverlays[0].textureHeight), runnerSelectionTexture);
    GUI.DrawTexture(new Rect(guiOverlays[0].offset.x + (Screen.width * 0.42), guiOverlays[1].offset.y, guiOverlays[1].textureWidth, guiOverlays[1].textureHeight), commnaderSelectionTexture);


    GUI.Label(new Rect(guiOverlays[0].offset.x - (Screen.width * 0.12), 0, guiOverlays[0].textureWidth, menuScript.getScale() * 245), "RUNNERS", "BlackBoldText");
    GUI.Label(new Rect(guiOverlays[0].offset.x + (Screen.width * 0.42), 0, guiOverlays[1].textureWidth, menuScript.getScale() * 245), "COMMANDERS", "BlackBoldText");

    //Get Selected Characters
    selectedCharacters = playerScript.getSelf().getTeam().getSelectedCharacters();



    if (GUI.Button(Rect(guiObject[0].offset.x + Screen.width * 0.01, guiObject[0].offset.y + Screen.height * 0.02, guiObject[1].textureWidth,  guiObject[1].textureHeight), "", "BackButton")) {
        selectCharacter = false;
        Util.playTap();
    }
    //Characters gui
    guiObject[1].textureWidth = Screen.width * 0.67;
    guiObject[1].textureHeight = Screen.height * 0.75;
    guiObject[1].setLocation(Points.Center);

    guiObject[0].textureWidth = Screen.width * 0.125;
    guiObject[0].textureHeight = Screen.height * 0.1667;


    for (var c = 0; c < 9; c++) {
        var offsetWidth = 0;
        var offsetHeight = 0;
        if (c == 0 || c == 1 || c == 2) {
            offsetHeight = Screen.height * 0.05;
        }
        if (c == 1 || c == 4 || c == 7) {
            offsetWidth = Screen.width * 0.15;
        }
        if (c == 2 || c == 5 || c == 8) {
            offsetWidth = Screen.width * 0.3;
        }
        if (c == 3 || c == 4 || c == 5) {
            offsetHeight = Screen.height * 0.30;
        }
        if (c == 6 || c == 7 || c == 8) {
            offsetHeight = Screen.height * 0.55;
        }

        playerTexture = Resources.Load("Textures/gui/player" + c, Texture2D);

        var isAlreadySelected = false;

        for (var character: int in selectedCharacters) {
            if (character == c && character != playerScript.getSelf().getCharacter()) {
                isAlreadySelected = true;
            }
        }

        if(isAlreadySelected){
            tmpColor = GUI.color;
            GUI.color = new Color(1,1,1,0.5f);
        }

        if (GUI.Button(Rect(guiObject[1].offset.x + offsetWidth, guiObject[1].offset.y + offsetHeight, guiObject[0].textureWidth, guiObject[0].textureHeight), playerTexture, "FullImage")) {

            if (!isAlreadySelected) {
                Util.playTap();
                gameManager.networkView.RPC("updateCharacter", RPCMode.All, playerScript.getSelf().getId(), c, Network.player);
                playerScript.getSelf().setCharacter(c);

                //If not hosting and changed character - you aren't ready.
                if (!isHosting && playerScript.getSelf().getReadyStatus()) {
                    playerScript.getSelf().updateReadyStatus(false);
                    gameManager.networkView.RPC("updateReadyStatus", RPCMode.All, playerScript.getSelf().getId(), playerScript.getSelf().getReadyStatus());
                }
                //But if you are hosting and select a character you are ready.
                if(isHosting){
                    playerScript.getSelf().updateReadyStatus(true);
                    gameManager.networkView.RPC("updateReadyStatus", RPCMode.All, playerScript.getSelf().getId(), playerScript.getSelf().getReadyStatus());
                }

                selectCharacter = false;
            }
        }

        if (isAlreadySelected) {
            GUI.color = tmpColor;
            GUI.Button(Rect(guiObject[1].offset.x + offsetWidth + guiObject[0].textureWidth / 2 + 10, (guiObject[1].offset.y + offsetHeight) + (Screen.height * 0.16 / 1.4) - guiObject[0].textureHeight / 1.1, menuScript.getScale() * 135, menuScript.getScale() * 105), readyCheckMarkTexture, "FullImage");
        }

        GUI.Label(Rect(guiObject[1].offset.x + offsetWidth - (Screen.width * 0.01), (guiObject[1].offset.y + offsetHeight) + (Screen.height * 0.13 / 1.4), Screen.width * 0.15, Screen.height * 0.20), charactersNames[c], "BlackText");

    }

    //Commanders gui
    var alreadyCommander : boolean = false;

    if(playerScript.getSelf().getTeam().getCommander() && playerScript.getSelf().GetType() != Commander) {
        alreadyCommander = true;
    }

    for (var p = 0; p < 3; p++) {
        var h = 0;
        if (p == 0) {
            h = Screen.height * 0.05;
        }
        if (p == 1) {
            h = Screen.height * 0.30;
        }
        if (p == 2) {
            h = Screen.height * 0.55;
        }

        var count = 9 + p;

        var isCommanderAlreadySelected = false;

        for (var character: int in selectedCharacters) {

            if (character == count && character != playerScript.getSelf().getCharacter()) {
                isCommanderAlreadySelected = true;
            }
        }

        commanderTexture = Resources.Load("Textures/gui/commander" + count, Texture2D);

        if(isCommanderAlreadySelected || alreadyCommander){
            tmpColor = GUI.color;
            GUI.color = new Color(1,1,1,0.5f);
        }

        if (GUI.Button(Rect(Screen.width * 0.71, guiObject[1].offset.y + h, guiObject[0].textureWidth, guiObject[0].textureHeight), commanderTexture, "FullImage")) {

           if(!alreadyCommander) {
                Util.playTap();
               if(!isCommanderAlreadySelected || !alreadyCommander){
                    gameManager.networkView.RPC("updateCharacter", RPCMode.All, playerScript.getSelf().getId(), count, Network.player);
                    playerScript.getSelf().setCharacter(count);

                    //If not hosting and changed character - you aren't ready.
                    if (!isHosting && playerScript.getSelf().getReadyStatus()) {
                        playerScript.getSelf().updateReadyStatus(false);
                        gameManager.networkView.RPC("updateReadyStatus", RPCMode.All, playerScript.getSelf().getId(), playerScript.getSelf().getReadyStatus());
                    }
                    //But if you are hosting and select a character you are ready.
                    if(isHosting){
                        playerScript.getSelf().updateReadyStatus(true);
                        gameManager.networkView.RPC("updateReadyStatus", RPCMode.All, playerScript.getSelf().getId(), playerScript.getSelf().getReadyStatus());
                    }

                    selectCharacter = false;
                }
            }
        }
        if(alreadyCommander) GUI.color = tmpColor;

        if (isCommanderAlreadySelected) {
            GUI.color = tmpColor;
            GUI.Button(Rect(Screen.width * 0.71 + guiObject[0].textureWidth / 2 + 10, guiObject[1].offset.y + h  - (Screen.height * 0.20 / 5), menuScript.getScale() * 135, menuScript.getScale() * 105), readyCheckMarkTexture, "FullImage");
        }
        GUI.Label(Rect(Screen.width * 0.7, guiObject[1].offset.y + h + (Screen.height * 0.13 / 1.4), Screen.width * 0.15, Screen.height * 0.20), charactersNames[count], "BlackText");

    }

}
function checkVersus(teamCount : int) {
    isVersus = gameSetupScript.game.getIsVersus();

    if (Config.VERSUS_ENABLED && teamCount > Config.MAX_TEAM_COUNT && !isVersus || !Config.VERSUS_ENABLED && Input.GetKey('v') && !isVersus) {
        gameManager.networkView.RPC("setVersusMode", RPCMode.AllBuffered, GameMode.Versus.ToString());
        isVersus = gameSetupScript.game.getIsVersus();
        selectCharacter = false;
    }
    else if(Config.VERSUS_ENABLED && teamCount < Config.MAX_TEAM_COUNT && isVersus || !Config.VERSUS_ENABLED && Input.GetKey('t') && isVersus){
        gameManager.networkView.RPC("setVersusMode", RPCMode.AllBuffered, GameMode.Team.ToString());
        isVersus = gameSetupScript.game.getIsVersus();
        selectCharacter = false;
    }
}
function setUpStyles(){

    //Scales different text based on windows size
    localStyle = GUI.skin.GetStyle("PlainText");
    localStyle.fontSize = menuScript.getScale() * bodyText;

    headerStyle = GUI.skin.GetStyle("Header");
    headerStyle.fontSize = menuScript.getScale() * headerText;

    greenStyle = GUI.skin.GetStyle("GreenButton");
    greenStyle.fontSize = menuScript.getScale() * buttonText;

    yellowStyle = GUI.skin.GetStyle("YellowButton");
    yellowStyle.fontSize = menuScript.getScale() * buttonText;

    disabledStyle = GUI.skin.GetStyle("DisabledButton");
    disabledStyle.fontSize = menuScript.getScale() * buttonText;

    whiteText = GUI.skin.GetStyle("WhiteText");
    whiteText.fontSize = menuScript.getScale() * buttonText;

    blackText = GUI.skin.GetStyle("BlackText");
    blackText.fontSize = menuScript.getScale() * buttonText;

    blackBoldText = GUI.skin.GetStyle("BlackBoldText");
    blackBoldText.fontSize = menuScript.getScale() * buttonText;

    GUI.skin.textField.fontSize = menuScript.getScale() * bodyText;
}
function switchingTeams() {

    //Check to see if on a team already, if on team 1, arrow needs to pount down...
    if (playerScript.getSelf().getTeamId() == 0) {
        if (GUI.Button(Rect(guiVersus[4].offset.x, guiVersus[4].offset.y - Screen.height * 0.05 - Screen.height * 0.1, guiVersus[4].textureWidth, guiVersus[4].textureHeight), arrowDownTexture, "FullImage")) {
            Util.playTap();
            gameManager.networkView.RPC("removeTeam", RPCMode.All, playerScript.getSelf().getId(), 0, Network.player);
            playerScript.getSelf().setTeamId(100);
        }

    } else if (playerScript.getSelf().getTeamId() == 1) {
        if (GUI.Button(Rect(guiVersus[4].offset.x, guiVersus[4].offset.y - Screen.height * 0.05 + Screen.height * 0.1, guiVersus[4].textureWidth, guiVersus[4].textureHeight), arrowTexture, "FullImage")) {
            Util.playTap();
            gameManager.networkView.RPC("removeTeam", RPCMode.All, playerScript.getSelf().getId(), 1, Network.player);
            playerScript.getSelf().setTeamId(100);
        }
    } else {
        if (GUI.Button(Rect(guiVersus[4].offset.x, guiVersus[4].offset.y - Screen.height * 0.05 - Screen.height * 0.1, guiVersus[4].textureWidth, guiVersus[4].textureHeight), (teamOneFull ? arrowTextureDisabled : arrowTexture), "FullImage")) {
            if (!teamOneFull) {
                Util.playTap();
                gameSetupScript.game.setTeam(playerScript.getSelf(), 0, Network.player);
                gameManager.networkView.RPC("setTeam", RPCMode.All, playerScript.getSelf().getId(), 0, Network.player);
            }
        }

        if (GUI.Button(Rect(guiVersus[4].offset.x, guiVersus[4].offset.y - Screen.height * 0.05 + Screen.height * 0.1, guiVersus[4].textureWidth, guiVersus[4].textureHeight), (teamTwoFull ? arrowDownTextureDisabled : arrowDownTexture), "FullImage")) {
            if (!teamTwoFull) {
                Util.playTap();
                gameSetupScript.game.setTeam(playerScript.getSelf(), 1, Network.player);
                gameManager.networkView.RPC("setTeam", RPCMode.All, playerScript.getSelf().getId(), 1, Network.player);
            }

        }
    }
}
