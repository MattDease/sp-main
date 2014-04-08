#pragma strict

private var gameManager : GameObject;
private var playerScript : PlayerScript;
private var stateScript : StateScript;
private var gameSetupScript : GameSetupScript;
private var optimizedHeight : float = 1024;

private var game : Game;
private var self : Player;
private var backgroundTexture : Texture2D;
private var teamScoreTexture : Texture2D;
private var countdown1 : Texture2D;
private var countdown2 : Texture2D;
private var countdown3 : Texture2D;
private var countdownGo : Texture2D;
private var redBarTexture : Texture2D;
private var coinTexture : Texture2D;
private var readyCheckMarkTexture : Texture2D;

private var purpleScoreTexture : Texture2D;
private var blueScoreTexture : Texture2D;
private var purpleOverlayTexture : Texture2D;
private var blueOverlayTexture : Texture2D;
private var inGameOverlay : Texture2D;
private var inGameOverlayWhite : Texture2D;

private var purpleEgg : Texture2D;
private var blueEgg : Texture2D;
private var sideArrow : Texture2D;

private var menuSkin : GUISkin;
private var localStyle :GUIStyle;
private var ingameBoldStyle : GUIStyle;
private var headerStyle :GUIStyle;
private var specheaderStyle :GUIStyle;
private var headerRestartStyle : GUIStyle;
private var greenStyle :GUIStyle;
private var yellowStyle :GUIStyle;
private var redStyle :GUIStyle;
private var whiteText :GUIStyle;
private var whiteTinyText :GUIStyle;
private var blackText :GUIStyle;
private var orangeText :GUIStyle;
private var scoreTextStyle : GUIStyle;
private var scoreBoldTextStyle : GUIStyle;
private var disabledStyle : GUIStyle;
private var mvpTextStyle : GUIStyle;
private var localWhiteStyle : GUIStyle;
private var ingameBoldWhiteStyle : GUIStyle;
private var ingameBoldWhiteStyle_R : GUIStyle;
private var scoreBoldWhiteTextStyle : GUIStyle;
private var scoreWhiteTextStyle : GUIStyle;

private var headerText = 70;
private var bodyText = 50;
private var buttonText = 30;
private var smallText = 40;
private var scoreText = 40;
private var tinyText = 20;
private var xsmallText = 35;

private var playerTexture : Texture2D;
private var playerSelfTexture : Texture2D;
private var playerMiniTexture : Texture2D;
private var playerTextures :Texture[] = new Texture[13];
private var playerSelfTextures :Texture[] = new Texture[13];
private var miniPlayerTextures :Texture[] = new Texture[13];

private var scoreLength : int = 8;

private var mvp: Runner;
private var justStarting : int = 0;

private var guiInGame: GuiClasses [];
guiInGame = new GuiClasses[15];
for (var z = 0; z < guiInGame.length; z++) {
    guiInGame[z] = new GuiClasses();
}


function Start(){
    gameManager = GameObject.Find("/GameManager");
    playerScript = gameManager.GetComponent(PlayerScript);
    stateScript = gameManager.GetComponent(StateScript);
    gameSetupScript = gameManager.GetComponent(GameSetupScript);

    game = gameSetupScript.game;
    self = playerScript.getSelf();

    backgroundTexture = Resources.Load("Textures/gui/end_bg", Texture2D);
    countdown1 = Resources.Load("Textures/gui/count_1", Texture2D);
    countdown2 = Resources.Load("Textures/gui/count_2", Texture2D);
    countdown3 = Resources.Load("Textures/gui/count_3", Texture2D);
    countdownGo = Resources.Load("Textures/gui/count_go", Texture2D);
    redBarTexture = Resources.Load("Textures/gui/redBar", Texture2D);
    teamScoreTexture = Resources.Load("Textures/gui/team_score", Texture2D);
    coinTexture = Resources.Load("Textures/gui/coin", Texture2D);
    readyCheckMarkTexture = Resources.Load("Textures/gui/readyCheckMark", Texture2D);
    purpleScoreTexture = Resources.Load("Textures/gui/purpleScoreOverlay", Texture2D);
    blueScoreTexture = Resources.Load("Textures/gui/blueScoreOverlay", Texture2D);
    purpleOverlayTexture = Resources.Load("Textures/gui/purpleTeamOverlay", Texture2D);
    blueOverlayTexture = Resources.Load("Textures/gui/blueTeamOVerlay", Texture2D);
    inGameOverlay = Resources.Load("Textures/gui/inGameBar", Texture2D);
    inGameOverlayWhite = Resources.Load("Textures/gui/inGameBarWhite", Texture2D);
    purpleEgg = Resources.Load("Textures/gui/eggPurple", Texture2D);
    blueEgg = Resources.Load("Textures/gui/eggBlue", Texture2D);

    sideArrow = Resources.Load("Textures/gui/side_arrow", Texture2D);

    menuSkin = Resources.Load("MenuSkin", GUISkin);

    for (var i = 0; i < 13; i++) {
        if (i < 9) {
            playerTexture = Resources.Load("Textures/gui/player" + i, Texture2D);
            playerSelfTexture = Resources.Load("Textures/gui/player" + i + "_self", Texture2D);
            playerMiniTexture = Resources.Load("Textures/gui/player" + i + "_mini", Texture2D);
        } else if (i < 12) {
            playerTexture = Resources.Load("Textures/gui/commander" + i, Texture2D);
            playerSelfTexture = Resources.Load("Textures/gui/commander" + i + "_self", Texture2D);
            playerMiniTexture = Resources.Load("Textures/gui/commander" + i, Texture2D);

        } else {
            playerTexture = Resources.Load("Textures/gui/player_empty", Texture2D);
            playerSelfTexture = Resources.Load("Textures/gui/player_empty_self", Texture2D);
            playerMiniTexture = Resources.Load("Textures/gui/player_empty", Texture2D);

        }
        playerTextures[i] = playerTexture;
        playerSelfTextures[i] = playerSelfTexture;
        miniPlayerTextures[i] = playerMiniTexture;

    }

}

function OnGUI(){
    GUI.skin = menuSkin;
    setUpStyles();
    //Countdown
    guiInGame[0].textureWidth = Screen.width;
    guiInGame[0].textureHeight = Screen.height;
    guiInGame[0].setLocation(Points.Center);

    var gameState = stateScript.getGameState();

    if(gameState == gameState.Playing){

        if(justStarting < 30) {
            GUI.DrawTexture(new Rect(guiInGame[0].offset.x, guiInGame[0].offset.y, guiInGame[0].textureWidth, guiInGame[0].textureHeight), countdownGo);
            justStarting++;
        }

        guiInGame[9].textureWidth = Screen.width /3;
        guiInGame[9].textureHeight = 100 * getScale();
        guiInGame[9].setLocation(Points.TopRight);

        guiInGame[10].textureWidth = 70 * getScale();
        guiInGame[10].textureHeight = 70 * getScale();
        guiInGame[10].setLocation(Points.TopRight);

        guiInGame[14].textureWidth = Screen.width/ 1.7;
        guiInGame[14].textureHeight = 100 * getScale();
        guiInGame[14].setLocation(Points.TopLeft);

        var myTeam : Team;
        if(playerScript.OBSERVER){
            if(playerScript.OBSERVED_TEAM == 1 && game.getMode() == GameMode.Team){
                playerScript.OBSERVED_TEAM = 0;
            }
            myTeam = game.getTeam(playerScript.OBSERVED_TEAM);
        }
        else{
            myTeam = self.getTeam();
        }

        if(Config.USE_EGG && myTeam.getRunners(true).Count == 1 && !playerScript.OBSERVER){
          GUI.DrawTexture(new Rect(guiInGame[14].offset.x + guiInGame[14].textureHeight/2, guiInGame[14].offset.y + guiInGame[14].textureHeight/2, guiInGame[14].textureWidth, guiInGame[14].textureHeight), inGameOverlayWhite);
          GUI.Label(new Rect(guiInGame[14].offset.x + guiInGame[14].textureHeight/2, guiInGame[14].offset.y + guiInGame[14].textureHeight/2, guiInGame[14].textureWidth, guiInGame[14].textureHeight), (self.GetType() == Commander ? "Hover over runner to help them jump" : "Jump when the commander is near you"), "SpecialHeader");

        }

        GUI.DrawTexture(new Rect(guiInGame[9].offset.x - guiInGame[9].textureHeight/2, guiInGame[9].offset.y + guiInGame[9].textureHeight/2, guiInGame[9].textureWidth, guiInGame[9].textureHeight), inGameOverlay);
        GUI.DrawTexture(new Rect(guiInGame[10].offset.x - guiInGame[9].textureHeight/2 - guiInGame[9].textureHeight/2 - (Screen.width * 0.05), guiInGame[10].offset.y + guiInGame[9].textureHeight/2 + guiInGame[10].textureHeight/4, guiInGame[10].textureWidth, guiInGame[10].textureHeight), coinTexture);
        GUI.Label(new Rect(guiInGame[10].offset.x - guiInGame[9].textureHeight/2 - guiInGame[9].textureHeight/2, guiInGame[9].offset.y + guiInGame[9].textureHeight/2, guiInGame[9].textureWidth, guiInGame[9].textureHeight), "X " + myTeam.getCoinCount(), "InGameBoldWhiteText");

        var myScore : int  =  myTeam.getRoundDistance() * 10;
        var numZeros : int = scoreLength - myScore.ToString().length;
        var newScore : String = "" ;

        for(var i :int  = 0; i < numZeros; i++){
             newScore += "0";
        }

        newScore += myScore.ToString();
        GUI.Label(new Rect(guiInGame[10].offset.x - (4.7*guiInGame[9].textureHeight), guiInGame[9].offset.y + guiInGame[9].textureHeight/2, guiInGame[9].textureWidth, guiInGame[9].textureHeight), newScore + " m", "InGameBoldWhiteText");
       //PROGRESS BAR && OFF SCREEN PLAYER CARDS

        guiInGame[11].textureWidth = 70 * getScale();
        guiInGame[11].textureHeight = 80 * getScale();
        guiInGame[11].setLocation(Points.BottomLeft);

        guiInGame[12].textureWidth = 44 * getScale();
        guiInGame[12].textureHeight = 80 * getScale();
        guiInGame[12].setLocation(Points.TopLeft);

        guiInGame[13].textureWidth = 80 * getScale();
        guiInGame[13].textureHeight = 80 * getScale();
        guiInGame[13].setLocation(Points.TopLeft);

        if (game.getMode() == GameMode.Versus) {

            var leadingTeam : Team = game.getLeadingTeam();
            var behindTeam : Team;
            var maxOffset : float = Screen.width/4;

            //Get the team that is behind
            for (var team: Team in game.getTeams()) {
                if(team.getId() != leadingTeam.getId()) {
                    behindTeam = team;
                }
            }

            var offset : int = 25 * getScale()  ;
            var distance = leadingTeam.getDistance() - behindTeam.getDistance();
            var yOffset : float = 0;

            offset = offset + distance;

            if(offset > Screen.width/4) offset = Screen.width/4;

            if(offset < (70 * getScale())){
                yOffset = guiInGame[11].textureHeight/6;
            }

            if(behindTeam == self.getTeam()){
                GUI.DrawTexture(new Rect(guiInGame[11].offset.x + (25 * getScale()), guiInGame[11].offset.y, guiInGame[11].textureWidth, guiInGame[11].textureHeight), (behindTeam.getId() == 0 ? purpleEgg : blueEgg));
                GUI.DrawTexture(new Rect(guiInGame[11].offset.x + offset, guiInGame[11].offset.y + yOffset, guiInGame[11].textureWidth, guiInGame[11].textureHeight), (leadingTeam.getId() == 0 ? purpleEgg : blueEgg));
            }
            else {
                GUI.DrawTexture(new Rect(guiInGame[11].offset.x + offset, guiInGame[11].offset.y, guiInGame[11].textureWidth, guiInGame[11].textureHeight), (leadingTeam.getId() == 0 ? purpleEgg : blueEgg));
                GUI.DrawTexture(new Rect(guiInGame[11].offset.x + (25 * getScale()), guiInGame[11].offset.y + yOffset, guiInGame[11].textureWidth, guiInGame[11].textureHeight), (behindTeam.getId() == 0 ? purpleEgg : blueEgg));
            }


        }

        //Show cards for each player off screen
        if(!playerScript.OBSERVER){
            for(var player : Player in self.getTeam().getTeammates().Values){
                if(player.getId() == self.getId() || player.GetType() == Commander){
                    continue;
                }
                var runner : Runner = player as Runner;
                if(!runner.isAlive()) {
                    continue;
                }
                var pos : Vector3 = player.getPosition();
                pos.y += 0.5;
                var screenPosition : Vector3 = Camera.main.WorldToScreenPoint(pos);
                if(screenPosition.x < 0){
                    var playerOffset : float = Screen.height - screenPosition.y;
                    GUI.DrawTexture(new Rect(guiInGame[12].offset.x + guiInGame[12].textureWidth/2, playerOffset, guiInGame[12].textureWidth, guiInGame[12].textureHeight), sideArrow);
                    GUI.Button(new Rect(guiInGame[13].offset.x + guiInGame[13].textureWidth , playerOffset, guiInGame[13].textureWidth, guiInGame[13].textureHeight), miniPlayerTextures[player.getCharacter()], "FullImage");
                }
            }
        }

    }

    if(gameState == GameState.Loading){
        switch(gameSetupScript.getCountDown()){
            case 0:
                  // GUI.DrawTexture(new Rect(guiInGame[0].offset.x, guiInGame[0].offset.y, guiInGame[0].textureWidth, guiInGame[0].textureHeight), countdownGo);
            break;
            case 1:
                  GUI.DrawTexture(new Rect(guiInGame[0].offset.x, guiInGame[0].offset.y, guiInGame[0].textureWidth, guiInGame[0].textureHeight), countdown1);
            break;
            case 2:
                GUI.DrawTexture(new Rect(guiInGame[0].offset.x, guiInGame[0].offset.y, guiInGame[0].textureWidth, guiInGame[0].textureHeight), countdown2);
            break;
            case 3:
            case 4:
                GUI.DrawTexture(new Rect(guiInGame[0].offset.x, guiInGame[0].offset.y, guiInGame[0].textureWidth, guiInGame[0].textureHeight), countdown3);
            break;
        }
    }

    if (gameState == GameState.Ended) {

      GUI.DrawTexture(new Rect(0, 0, Screen.width, Screen.height), backgroundTexture);
      GUI.DrawTexture(new Rect(0, Screen.height - 200 * getScale(), Screen.width, 200 * getScale()), redBarTexture);

      guiInGame[1].textureWidth = Screen.width * 0.17;
      guiInGame[1].textureHeight = Screen.height * 0.14;
      guiInGame[1].setLocation(Points.BottomRight);

      var voteStr: String = "";
      var cointText: String = "";

      var winner: Team = game.getLeadingTeam();
      var restartCount: int = 0;
      var d: int = 0;
      var layoutOffset = 0;

    if (game.getMode() == GameMode.Team) {

     for (var team: Team in game.getTeams()) {

         guiInGame[2].textureWidth = Screen.width / 3;
         guiInGame[2].textureHeight = Screen.height / 4;
         guiInGame[2].setLocation(Points.Center);
         GUI.DrawTexture(new Rect(Screen.width - guiInGame[2].textureWidth - Screen.width * 0.1, guiInGame[2].offset.y - guiInGame[2].offset.y / 3, guiInGame[2].textureWidth, guiInGame[2].textureHeight), teamScoreTexture);

         GUI.Label(new Rect(guiInGame[2].offset.x + guiInGame[2].offset.x / 1.3, guiInGame[2].offset.y - (150 * getScale()), guiInGame[1].textureWidth, guiInGame[1].textureHeight), "Distance", "InGameText");
         GUI.Label(new Rect(guiInGame[2].offset.x + guiInGame[2].offset.x / 1.3, guiInGame[2].offset.y - (80 * getScale()), guiInGame[1].textureWidth, guiInGame[1].textureHeight), "Coins", "InGameText");
         GUI.Label(new Rect(guiInGame[2].offset.x + guiInGame[2].offset.x / 1.3, guiInGame[2].offset.y + (10 * getScale()), guiInGame[1].textureWidth, guiInGame[1].textureHeight), "Total Score", "ScoreText");

         GUI.Label(new Rect(guiInGame[2].offset.x + guiInGame[2].offset.x * 1.13, guiInGame[2].offset.y - (150 * getScale()), guiInGame[1].textureWidth, guiInGame[1].textureHeight), (team.getRoundDistance() * 10) + " m", "InGameBoldText");

         cointText = "X " + team.getCoinCount();

         guiInGame[4].textureWidth = Screen.width * 0.035;
         guiInGame[4].textureHeight = Screen.height * 0.035;
         guiInGame[4].setLocation(Points.Center);

         GUI.Label(new Rect(guiInGame[2].offset.x + guiInGame[2].offset.x * 1.15, guiInGame[2].offset.y - (80 * getScale()), guiInGame[1].textureWidth, guiInGame[1].textureHeight), cointText, "InGameBoldText");
         GUI.Label(new Rect(guiInGame[2].offset.x + guiInGame[2].offset.x * 1.15, guiInGame[2].offset.y + (10 * getScale()), guiInGame[1].textureWidth, guiInGame[1].textureHeight), team.getPoints() + "", "ScoreBoldText");

         GUI.Button(new Rect((2*guiInGame[2].offset.x) - guiInGame[2].offset.x/12, guiInGame[2].offset.y - (25 * getScale()), guiInGame[4].textureWidth, guiInGame[4].textureHeight), coinTexture, "FullImage");

         for (var player: Player in team.getTeammates().Values) {
             if (player.getRestartVote())++restartCount;
         }

         guiInGame[3].textureWidth = Screen.width * 0.10;
         guiInGame[3].textureHeight = Screen.height * 0.134;
         guiInGame[3].setLocation(Points.Center);

         //MVP
         if(!mvp) mvp = team.getMVP();

         if (mvp) {
             if (self == mvp) {
                 GUI.Button(new Rect(guiInGame[3].offset.x + ((-3) * guiInGame[3].textureWidth), guiInGame[3].offset.y - (guiInGame[3].textureHeight * 1.7), guiInGame[3].textureWidth, guiInGame[3].textureHeight), playerSelfTextures[self.getCharacter()], "FullImage");
             } else {
                 GUI.Button(new Rect(guiInGame[3].offset.x + ((-3) * guiInGame[3].textureWidth), guiInGame[3].offset.y - (guiInGame[3].textureHeight * 1.7), guiInGame[3].textureWidth, guiInGame[3].textureHeight), playerTextures[mvp.getCharacter()], "FullImage");
             }
             GUI.Label(new Rect(guiInGame[3].offset.x + ((-1.8) * guiInGame[3].textureWidth), guiInGame[3].offset.y - (guiInGame[3].textureHeight * 1.9), guiInGame[1].textureWidth * 2, guiInGame[1].textureHeight), "MVP Runner", "MVPHeader");
             GUI.Label(new Rect(guiInGame[3].offset.x + ((-1.8) * guiInGame[3].textureWidth), guiInGame[3].offset.y - (guiInGame[3].textureHeight * 1.5), guiInGame[1].textureWidth * 2, guiInGame[1].textureHeight), "Total Distance: " + team.getRoundDistance() + "m", "TinyWhiteText");
             GUI.Label(new Rect(guiInGame[3].offset.x + ((-3) * guiInGame[3].textureWidth), guiInGame[3].offset.y - (guiInGame[3].textureHeight * 1.5) + (Screen.height * 0.08), guiInGame[3].textureWidth, guiInGame[3].textureHeight), mvp.getName(), "WhiteText");

             if (mvp.getRestartVote()) {
                 GUI.Button(Rect(guiInGame[3].offset.x + ((-3) * guiInGame[3].textureWidth) + guiInGame[3].textureWidth / 2 + (Screen.width * 0.01), guiInGame[3].offset.y - (guiInGame[3].textureHeight * 1.7) - (Screen.height * 0.02), getScale() * 101.5, getScale() * 78.5), readyCheckMarkTexture, "FullImage");
             }

         } else {
             GUI.Button(new Rect(guiInGame[3].offset.x + ((-3) * guiInGame[3].textureWidth), guiInGame[3].offset.y - (guiInGame[3].textureHeight * 1.7), guiInGame[3].textureWidth, guiInGame[3].textureHeight), playerTextures[12], "FullImage");
             GUI.Label(new Rect(guiInGame[3].offset.x + ((-1.8) * guiInGame[3].textureWidth), guiInGame[3].offset.y - (guiInGame[3].textureHeight * 1.9), guiInGame[1].textureWidth * 2, guiInGame[1].textureHeight), "No MVP Runner", "MVPHeader");
         }

         var teamShowEmpty: boolean = false;
         var teamCount: int = 0;
         var teamCountWithoutMVP = 0;
         var teammates: Dictionary. < String, Player > = team.getTeammates();
         var tempPlayer: Player;
         //Other Players
         for (d = 0; d < Config.MAX_TEAM_COUNT; d++) {

             teamCount = d;

             if (teamCount >= team.getTeammates().Count) {
                 teamShowEmpty = true;
                 tempPlayer = null;
             } else {
                 tempPlayer = teammates[teammates.Keys.ToList()[d]];
             }

             if (tempPlayer != mvp) {
                 switch (teamCountWithoutMVP) {
                 case 0:
                     layoutOffset = (-2) * guiInGame[3].textureWidth;
                     break;
                 case 1:
                     layoutOffset = (-1) * guiInGame[3].textureWidth;
                     break;
                 case 2:
                     layoutOffset = 0;
                     break;
                 case 3:
                     layoutOffset = (1) * guiInGame[3].textureWidth;
                     break;
                 }

                 ++teamCountWithoutMVP;

                 if (teamShowEmpty) {
                     GUI.Button(Rect(guiInGame[3].offset.x / 1.5 + layoutOffset, guiInGame[3].offset.y, guiInGame[3].textureWidth, guiInGame[3].textureHeight), playerTextures[12], "FullImage");
                 } else {
                     if (self == tempPlayer) {
                         GUI.Button(Rect(guiInGame[3].offset.x / 1.5 + layoutOffset, guiInGame[3].offset.y, guiInGame[3].textureWidth, guiInGame[3].textureHeight), playerSelfTextures[tempPlayer.getCharacter()], "FullImage");
                     } else {
                        GUI.Button(Rect(guiInGame[3].offset.x / 1.5 + layoutOffset, guiInGame[3].offset.y, guiInGame[3].textureWidth, guiInGame[3].textureHeight), playerTextures[tempPlayer.getCharacter()], "FullImage");
                    }

                     GUI.Label(Rect(guiInGame[3].offset.x / 1.5 + layoutOffset, guiInGame[3].offset.y + (Screen.height * 0.11), guiInGame[3].textureWidth, guiInGame[3].textureHeight), tempPlayer.getName(), "WhiteText");

                     if (tempPlayer.getRestartVote()) {
                         GUI.Button(Rect(guiInGame[3].offset.x / 1.5 + layoutOffset + guiInGame[3].textureWidth / 2 + (Screen.width * 0.01), guiInGame[3].offset.y - (Screen.height * 0.02), getScale() * 101.5, getScale() * 78.5), readyCheckMarkTexture, "FullImage");
                     }

                 }
             }
         }
             //HOST
             if (Network.isServer) {
                if (!self.getRestartVote()) gameManager.networkView.RPC("voteForRestart", RPCMode.All, self.getId(), true);

                if (Network.isServer && game.canRestart()) {
                     if (GUI.Button(Rect(guiInGame[1].offset.x, Screen.height - Screen.height * 0.16, guiInGame[1].textureWidth, guiInGame[1].textureHeight), "RESTART", "GreenButton")) {
                         Util.playTap();
                         gameSetupScript.restartGame();
                     }
                 }  else if (Network.isServer && !game.canRestart()) {
                     GUI.Button(Rect(guiInGame[1].offset.x, Screen.height - Screen.height * 0.16, guiInGame[1].textureWidth, guiInGame[1].textureHeight), "RESTART", "DisabledButton");
                }

                 if (GUI.Button(Rect(guiInGame[1].offset.x - (Screen.width * 0.17), Screen.height - Screen.height * 0.16, guiInGame[1].textureWidth, guiInGame[1].textureHeight), "GAME SETUP", "GreenButton")) {
                    Util.playTap();
                     gameSetupScript.returnToMenu();
                 }

                 if (GUI.Button(Rect(guiInGame[1].offset.x - 2 * (Screen.width * 0.17), Screen.height - Screen.height * 0.16, guiInGame[1].textureWidth, guiInGame[1].textureHeight), "QUIT", "RedButton")) {
                     Util.playTap();
                     gameSetupScript.leaveGame();
                 }
                 voteStr = restartCount + "/" + self.getTeam().getTeammates().Count + " players voted to play again!";
                 GUI.Label(new Rect(guiInGame[1].offset.x - 3.5 * (Screen.width * 0.22), Screen.height - Screen.height * 0.16, 2.5 * guiInGame[1].textureWidth, guiInGame[1].textureHeight), voteStr, "OrangeText");

             } else if(!playerScript.OBSERVER) {
                 if (!self.getRestartVote()) {
                    if (GUI.Button(Rect(guiInGame[1].offset.x - (Screen.width * 0.17), Screen.height - Screen.height * 0.16, guiInGame[1].textureWidth, guiInGame[1].textureHeight), "YES", "GreenButton")) {
                     Util.playTap();
                        gameManager.networkView.RPC("voteForRestart", RPCMode.All, self.getId(), true);
                    }
                 } else {
                     GUI.Button(Rect(guiInGame[1].offset.x - (Screen.width * 0.17), Screen.height - Screen.height * 0.16, guiInGame[1].textureWidth, guiInGame[1].textureHeight), "YES", "DisabledButton");
                 }

                if (GUI.Button(Rect(guiInGame[1].offset.x, Screen.height - Screen.height * 0.16, guiInGame[1].textureWidth, guiInGame[1].textureHeight), "QUIT", "RedButton")) {
                     Util.playTap();
                     gameSetupScript.leaveGame();

                 }

                if(!playerScript.OBSERVER){
                    voteStr = restartCount + "/" + self.getTeam().getTeammates().Count + " players voted to play again!";
                    GUI.Label(new Rect(guiInGame[1].offset.x - 2.6 * (Screen.width * 0.17), Screen.height - Screen.height * 0.18, guiInGame[1].textureWidth * 1.5, guiInGame[1].textureHeight), (self.getRestartVote() ? "You voted!" : "Play Again?"), "RestartHeader");
                    GUI.Label(new Rect(guiInGame[1].offset.x - 2.5 * (Screen.width * 0.23), Screen.height - Screen.height * 0.12, 2.5 * guiInGame[1].textureWidth, guiInGame[1].textureHeight), voteStr, "OrangeText");
                }

             }
         }
     }

  else if (game.getMode() == GameMode.Versus) {

      var allMembers : int = 0;

      for (var team: Team in game.getTeams()) {

          for (var player: Player in team.getTeammates().Values) {
              if (player.getRestartVote()) ++restartCount;
              ++allMembers;
          }

            guiInGame[5].textureWidth = Screen.width / 9;
            guiInGame[5].textureHeight = Screen.height / 1.1;
            guiInGame[5].setLocation(Points.TopLeft);

            guiInGame[6].textureWidth = Screen.width / 9;
            guiInGame[6].textureHeight = Screen.height / 1.1;
            guiInGame[6].setLocation(Points.TopRight);

            guiInGame[7].textureWidth = Screen.width / 1.6;
            guiInGame[7].textureHeight = Screen.height / 4;
            guiInGame[7].setLocation(Points.Center);

            guiInGame[8].textureWidth = Screen.width * 0.095;
            guiInGame[8].textureHeight = Screen.height * 0.128;
            guiInGame[8].setLocation(Points.Center);

            guiInGame[4].textureWidth = Screen.width * 0.035;
            guiInGame[4].textureHeight = Screen.height * 0.035;
            guiInGame[4].setLocation(Points.Center);

          if (team.getId() == 0) {
              GUI.DrawTexture(new Rect(guiInGame[7].offset.x, guiInGame[7].offset.y - guiInGame[7].offset.y / 2, guiInGame[7].textureWidth, guiInGame[7].textureHeight), purpleScoreTexture);
              GUI.DrawTexture(new Rect(guiInGame[5].offset.x + (Screen.width * 0.029), guiInGame[5].offset.y + (Screen.height * 0.042), guiInGame[5].textureWidth, guiInGame[5].textureHeight), purpleOverlayTexture);

              GUI.Label(new Rect(guiInGame[7].offset.x + guiInGame[7].offset.x / 8, guiInGame[7].offset.y - (205 * getScale()), guiInGame[1].textureWidth, guiInGame[1].textureHeight), "Distance", "InGameWhiteText");
              GUI.Label(new Rect(guiInGame[7].offset.x + guiInGame[7].offset.x / 8, guiInGame[7].offset.y - (145 * getScale()), guiInGame[1].textureWidth, guiInGame[1].textureHeight), "Coins", "InGameWhiteText");
              GUI.Label(new Rect(guiInGame[7].offset.x + guiInGame[7].offset.x / 8, guiInGame[7].offset.y - (60 * getScale()), guiInGame[1].textureWidth, guiInGame[1].textureHeight), "Total Score", "ScoreWhiteText");
              GUI.Button(new Rect(guiInGame[7].offset.x + guiInGame[7].offset.x / 2.6, guiInGame[7].offset.y - (90 * getScale()), guiInGame[4].textureWidth, guiInGame[4].textureHeight), coinTexture, "FullImage");

              cointText = "X " + team.getCoinCount();

              GUI.Label(new Rect(guiInGame[7].offset.x + guiInGame[7].offset.x * 2.3, guiInGame[7].offset.y - (205 * getScale()), guiInGame[1].textureWidth, guiInGame[1].textureHeight), (team.getRoundDistance() * 10) +" m", "InGameBoldWhiteText_R");
              GUI.Label(new Rect(guiInGame[7].offset.x + guiInGame[7].offset.x * 2.3, guiInGame[7].offset.y - (145 * getScale()), guiInGame[1].textureWidth, guiInGame[1].textureHeight), cointText, "InGameBoldWhiteText_R");
              GUI.Label(new Rect(guiInGame[7].offset.x + guiInGame[7].offset.x * 2.3, guiInGame[7].offset.y - (60 * getScale()), guiInGame[1].textureWidth, guiInGame[1].textureHeight), team.getPoints()+ "", "ScoreBoldWhiteText");

          } else if (team.getId() == 1) {
              GUI.DrawTexture(new Rect(guiInGame[7].offset.x, guiInGame[7].offset.y + guiInGame[7].offset.y / 2 - guiInGame[7].offset.y / 6, guiInGame[7].textureWidth, guiInGame[7].textureHeight), blueScoreTexture);
              GUI.DrawTexture(new Rect(guiInGame[6].offset.x - (Screen.width * 0.035), guiInGame[6].offset.y + (Screen.height * 0.042), guiInGame[6].textureWidth, guiInGame[6].textureHeight), blueOverlayTexture);

              GUI.Label(new Rect(guiInGame[7].offset.x + guiInGame[7].offset.x / 8, 1.83 * guiInGame[7].offset.y - (205 * getScale()), guiInGame[1].textureWidth, guiInGame[1].textureHeight), "Distance", "InGameWhiteText");
              GUI.Label(new Rect(guiInGame[7].offset.x + guiInGame[7].offset.x / 8, 1.83 * guiInGame[7].offset.y - (145 * getScale()), guiInGame[1].textureWidth, guiInGame[1].textureHeight), "Coins", "InGameWhiteText");
              GUI.Label(new Rect(guiInGame[7].offset.x + guiInGame[7].offset.x / 8, 1.83 * guiInGame[7].offset.y - (60 * getScale()), guiInGame[1].textureWidth, guiInGame[1].textureHeight), "Total Score", "ScoreWhiteText");
              GUI.Button(new Rect(guiInGame[7].offset.x + guiInGame[7].offset.x / 2.6, 1.83 * guiInGame[7].offset.y - (90 * getScale()), guiInGame[4].textureWidth, guiInGame[4].textureHeight), coinTexture, "FullImage");

              cointText = "X " + team.getCoinCount();

              GUI.Label(new Rect(guiInGame[7].offset.x + guiInGame[7].offset.x * 2.3, 1.83 * guiInGame[7].offset.y - (205 * getScale()), guiInGame[1].textureWidth, guiInGame[1].textureHeight), (team.getRoundDistance() * 10) + " m", "InGameBoldWhiteText_R");
              GUI.Label(new Rect(guiInGame[7].offset.x + guiInGame[7].offset.x * 2.3, 1.83 * guiInGame[7].offset.y - (145 * getScale()), guiInGame[1].textureWidth, guiInGame[1].textureHeight), cointText, "InGameBoldWhiteText_R");
              GUI.Label(new Rect(guiInGame[7].offset.x + guiInGame[7].offset.x * 2.3, 1.83 * guiInGame[7].offset.y - (60 * getScale()), guiInGame[1].textureWidth, guiInGame[1].textureHeight), team.getPoints() + "", "ScoreBoldWhiteText");


          }

        var vsTeammates: Dictionary. <String, Player> = team.getTeammates();
        var vsShowEmpty: boolean = false;
        var vsCount: int = 0;
        var vsPlayer: Player;

          for (d = 0; d < Config.MAX_TEAM_COUNT; d++) {

            vsCount = d;

            if (vsCount >= team.getTeammates().Count) {
                vsShowEmpty = true;
                vsPlayer = null;
            } else {
                vsPlayer = vsTeammates[vsTeammates.Keys.ToList()[d]];
            }

              switch (d) {
              case 0:
                  layoutOffset = (-2) * guiInGame[8].textureHeight - guiInGame[8].textureHeight / 1.25;
                  break;
              case 1:
                  layoutOffset = (-1) * guiInGame[8].textureHeight - guiInGame[8].textureHeight / 2.5;
                  break;
              case 2:
                  layoutOffset = 0;
                  break;
              case 3:
                  layoutOffset = (1) * guiInGame[8].textureHeight + guiInGame[8].textureHeight / 2.5;
                  break;
              case 4:
                  layoutOffset = (2) * guiInGame[8].textureHeight + guiInGame[8].textureHeight / 1.25;
                  break;
              }

              if (team.getId() == 0) {
                if (vsShowEmpty) {
                    GUI.Button(Rect(guiInGame[5].offset.x + (Screen.width * 0.035), guiInGame[8].offset.y + layoutOffset - (Screen.height * 0.02), guiInGame[8].textureWidth, guiInGame[8].textureHeight), playerTextures[12], "FullImage");
                 } else {

                    if (self == vsPlayer) {
                        GUI.Button(Rect(guiInGame[5].offset.x + (Screen.width * 0.035), guiInGame[8].offset.y + layoutOffset - (Screen.height * 0.02), guiInGame[8].textureWidth, guiInGame[8].textureHeight), playerSelfTextures[vsPlayer.getCharacter()], "FullImage");
                    } else {
                        GUI.Button(Rect(guiInGame[5].offset.x + (Screen.width * 0.035), guiInGame[8].offset.y + layoutOffset - (Screen.height * 0.02), guiInGame[8].textureWidth, guiInGame[8].textureHeight), playerTextures[vsPlayer.getCharacter()], "FullImage");
                    }


                    GUI.Label(Rect(guiInGame[5].offset.x + (Screen.width * 0.035), guiInGame[8].offset.y + layoutOffset + (Screen.height * 0.065), guiInGame[8].textureWidth, guiInGame[8].textureHeight), vsPlayer.getName(), "WhiteText");

                     if (vsPlayer.getRestartVote()) {
                         GUI.Button(Rect(guiInGame[5].offset.x + (Screen.width * 0.035) + guiInGame[8].textureWidth/1.6, guiInGame[8].offset.y + layoutOffset + (Screen.height * 0.065) -guiInGame[8].textureHeight/1.2, getScale() * 101.5, getScale() * 78.5), readyCheckMarkTexture, "FullImage");
                     }
                 }
              } else {
                 if (vsShowEmpty) {
                    GUI.Button(Rect(guiInGame[6].offset.x - (Screen.width * 0.029), guiInGame[8].offset.y + layoutOffset - (Screen.height * 0.02), guiInGame[8].textureWidth, guiInGame[8].textureHeight), playerTextures[12], "FullImage");
                 } else {
                    if(self == vsPlayer){
                        GUI.Button(Rect(guiInGame[6].offset.x - (Screen.width * 0.029), guiInGame[8].offset.y + layoutOffset - (Screen.height * 0.02), guiInGame[8].textureWidth, guiInGame[8].textureHeight), playerSelfTextures[vsPlayer.getCharacter()], "FullImage");
                    } else {
                        GUI.Button(Rect(guiInGame[6].offset.x - (Screen.width * 0.029), guiInGame[8].offset.y + layoutOffset - (Screen.height * 0.02), guiInGame[8].textureWidth, guiInGame[8].textureHeight), playerTextures[vsPlayer.getCharacter()], "FullImage");
                    }
                    GUI.Label(Rect(guiInGame[6].offset.x - (Screen.width * 0.029), guiInGame[8].offset.y + layoutOffset + (Screen.height * 0.065), guiInGame[8].textureWidth, guiInGame[8].textureHeight), vsPlayer.getName(), "WhiteText");

                     if (vsPlayer.getRestartVote()) {
                         GUI.Button(Rect(guiInGame[6].offset.x - (Screen.width * 0.029) + guiInGame[8].textureWidth/1.6, guiInGame[8].offset.y + layoutOffset + (Screen.height * 0.065) -guiInGame[8].textureHeight/1.2, getScale() * 101.5, getScale() * 78.5), readyCheckMarkTexture, "FullImage");
                     }

                 }

              }
          }

      }

      GUI.Label(new Rect(0, Screen.height / 2 - Screen.height / 2.5, Screen.width, 0), (winner.getId() == 0 ? "Purple" : "Blue") + " wins!", "Header");

      if (Network.isServer) {

          if (!self.getRestartVote()) gameManager.networkView.RPC("voteForRestart", RPCMode.All, self.getId(), true);

          if (Network.isServer && game.canRestart()) {
              if (GUI.Button(Rect(guiInGame[1].offset.x - Screen.width / 4, Screen.height - Screen.height * 0.2, guiInGame[1].textureWidth, guiInGame[1].textureHeight), "RESTART", "GreenButton")) {
                  Util.playTap();
                  gameSetupScript.restartGame();
              }
          }
          else if (Network.isServer && !game.canRestart()) {
              GUI.Button(Rect(guiInGame[1].offset.x - Screen.width / 4, Screen.height - Screen.height * 0.2, guiInGame[1].textureWidth, guiInGame[1].textureHeight), "RESTART", "DisabledButton");
          }

          if (GUI.Button(Rect(guiInGame[1].offset.x - (Screen.width * 0.17) - Screen.width / 4, Screen.height - Screen.height * 0.2, guiInGame[1].textureWidth, guiInGame[1].textureHeight), "GAME SETUP", "YellowButton")) {
               Util.playTap();
              gameSetupScript.returnToMenu();
          }

          if (GUI.Button(Rect(guiInGame[1].offset.x - 2 * (Screen.width * 0.17) - Screen.width / 4, Screen.height - Screen.height * 0.2, guiInGame[1].textureWidth, guiInGame[1].textureHeight), "QUIT", "RedButton")) {
              Util.playTap();
              gameSetupScript.leaveGame();
          }
          voteStr = restartCount + "/" + allMembers + " players voted to play again";
          GUI.Label(new Rect(0, Screen.height - Screen.height * 0.12, Screen.width, guiInGame[1].textureHeight), voteStr, "OrangeText");

      } else if(!playerScript.OBSERVER) {
          if (!self.getRestartVote()) {
              if (GUI.Button(Rect(guiInGame[1].offset.x - Screen.width / 5, Screen.height - Screen.height * 0.16, guiInGame[1].textureWidth, guiInGame[1].textureHeight), "YES", "GreenButton")) {
                  Util.playTap();
                  gameManager.networkView.RPC("voteForRestart", RPCMode.All, self.getId(), true);
              }
          } else {
              GUI.Button(Rect(guiInGame[1].offset.x - Screen.width / 5, Screen.height - Screen.height * 0.16, guiInGame[1].textureWidth, guiInGame[1].textureHeight), "YES", "DisabledButton");
          }

          if (GUI.Button(Rect(guiInGame[1].offset.x - (Screen.width * 0.17) - Screen.width / 5, Screen.height - Screen.height * 0.16, guiInGame[1].textureWidth, guiInGame[1].textureHeight), "QUIT", "RedButton")) {
              Util.playTap();
              gameSetupScript.leaveGame();
          }

          voteStr = restartCount + "/" + allMembers + " players voted to play again";
          GUI.Label(new Rect(guiInGame[1].offset.x - 2.6 * (Screen.width * 0.16) - Screen.width / 5, Screen.height - Screen.height * 0.18, guiInGame[1].textureWidth * 1.5, guiInGame[1].textureHeight), (self.getRestartVote() ? "You voted!" : "Play Again?"), "RestartHeader");
          GUI.Label(new Rect(guiInGame[1].offset.x - 2.5 * (Screen.width * 0.215) - Screen.width / 5, Screen.height - Screen.height * 0.12, 2.5 * guiInGame[1].textureWidth, guiInGame[1].textureHeight), voteStr, "OrangeText");

      }

  }
    }
    if(Config.DEBUG){
       // OnDebugGUI();
    }

}

function OnDebugGUI(){
    GUILayout.BeginArea(Rect (Screen.width - 10 - 200, 10, 200, Screen.height - 10*2));
    GUILayout.BeginVertical(GUILayout.MaxHeight(Screen.height - 10*2));
    GUI.backgroundColor = Color.white;
    GUI.contentColor = Color.black;

    GUILayout.Label("Debug Menu");

    if(GUILayout.Button("Leave Game")){
        gameSetupScript.leaveGame();
        return;
    }

    var gameState = stateScript.getGameState();

    GUILayout.Space(10);
    GUILayout.Label("State: " + gameState.ToString());

    switch(gameState){
        case GameState.Uninitialized :
            break;
        case GameState.Loading :
            GUILayout.Space(10);
            GUILayout.Label("Game Starts In: " + gameSetupScript.getCountDown());
            break;
        case GameState.Playing :
            var teams : List.<Team> = game.getTeams();
            for(var team : Team in teams){
                GUILayout.Space(10);
                GUILayout.Label("Team " + team.getId() + " - Distance: " + team.getDistance() + " - Coins: " + team.getCoinCount() + (!team.isAlive() ? " - dead" : ""));
                for(var player : Player in team.getTeammates().Values){
                    GUILayout.Label("- " + (player.GetType() == Runner ? "(R) " : "(C) ") + player.getName() + (Util.IsNetworkedPlayerMe(player) ? " (me)" : ""));
                }
            }
            break;
        case GameState.Ended :
            var winner : Team = game.getLeadingTeam();
            for(var team : Team in game.getTeams()){
                GUILayout.Space(10);
                if(game.getMode() == GameMode.Versus && winner.getId() == team.getId()){
                    GUILayout.Label("You are winner!");
                }
                GUILayout.Label("Points : " + team.getPoints());
                GUILayout.Label("Dist : " + team.getDistance() + " Coin : " + team.getCoinCount());
                for(var player : Player in team.getTeammates().Values){
                    GUILayout.Label(player.getName() + " - " + player.getRestartVote());
                }
            }
            if(!self.getRestartVote()){
                if(game.isValid() && GUILayout.Button("Vote for Restart")){
                    Util.playTap();
                    gameManager.networkView.RPC("voteForRestart", RPCMode.All, self.getId(), true);
                }
            }
            else if(Network.isServer && game.canRestart()){
                if(GUILayout.Button("Restart Game")){
                    Util.playTap();
                    gameSetupScript.restartGame();
                }
            }
            if(Network.isServer){
                if(GUILayout.Button("Return to Game Menu")){
                    gameSetupScript.returnToMenu();
                    Util.playTap();
                }
            }
            if(GUILayout.Button("Leave")){
                Util.playTap();
                gameSetupScript.leaveGame();
            }
            break;
        case GameState.Error :
            GUILayout.Space(10);
            GUILayout.Label("Error in game setup");
            break;
    }

    GUILayout.EndVertical();
    GUILayout.EndArea();
}

function setUpStyles(){

    //Scales different text based on windows size
    localStyle = GUI.skin.GetStyle("InGameText");
    localStyle.fontSize = getScale() * xsmallText;

    ingameBoldStyle = GUI.skin.GetStyle("InGameBoldText");
    ingameBoldStyle.fontSize = getScale() * xsmallText;

    localWhiteStyle = GUI.skin.GetStyle("InGameWhiteText");
    localWhiteStyle.fontSize = getScale() * xsmallText;

    ingameBoldWhiteStyle = GUI.skin.GetStyle("InGameBoldWhiteText");
    ingameBoldWhiteStyle.fontSize = getScale() * xsmallText;

    ingameBoldWhiteStyle_R = GUI.skin.GetStyle("InGameBoldWhiteText_R");
    ingameBoldWhiteStyle_R.fontSize = getScale() * xsmallText;

    headerStyle = GUI.skin.GetStyle("Header");
    headerStyle.fontSize = getScale() * headerText;

    headerRestartStyle = GUI.skin.GetStyle("RestartHeader");
    headerRestartStyle.fontSize = getScale() * headerText;

    greenStyle = GUI.skin.GetStyle("GreenButton");
    greenStyle.fontSize = getScale() * buttonText;

    yellowStyle = GUI.skin.GetStyle("YellowButton");
    yellowStyle.fontSize = getScale() * buttonText;

    redStyle = GUI.skin.GetStyle("RedButton");
    redStyle.fontSize = getScale() * buttonText;

    disabledStyle = GUI.skin.GetStyle("DisabledButton");
    disabledStyle.fontSize = getScale() * buttonText;

    whiteText = GUI.skin.GetStyle("WhiteText");
    whiteText.fontSize = getScale() * buttonText;

    whiteTinyText = GUI.skin.GetStyle("TinyWhiteText");
    whiteTinyText.fontSize = getScale() * buttonText;

    blackText = GUI.skin.GetStyle("BlackText");
    blackText.fontSize = getScale() * buttonText;

    orangeText = GUI.skin.GetStyle("OrangeText");
    orangeText.fontSize = getScale() * smallText;

    scoreTextStyle = GUI.skin.GetStyle("ScoreText");
    scoreTextStyle.fontSize = getScale() * scoreText;

    scoreBoldTextStyle = GUI.skin.GetStyle("ScoreBoldText");
    scoreBoldTextStyle.fontSize = getScale() * scoreText;

    scoreWhiteTextStyle = GUI.skin.GetStyle("ScoreWhiteText");
    scoreWhiteTextStyle.fontSize = getScale() * scoreText;

    scoreBoldWhiteTextStyle = GUI.skin.GetStyle("ScoreBoldWhiteText");
    scoreBoldWhiteTextStyle.fontSize = getScale() * scoreText;

    mvpTextStyle = GUI.skin.GetStyle("MVPHeader");
    mvpTextStyle.fontSize = getScale() * 55;

    specheaderStyle =  GUI.skin.GetStyle("SpecialHeader");
    specheaderStyle.fontSize = getScale() * 50;

    GUI.skin.textField.fontSize = getScale() * bodyText;
}

function getScale () : float{
    return Screen.height / optimizedHeight;
}

