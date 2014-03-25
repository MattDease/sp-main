#pragma strict

import System.Collections.Generic;

public class Game {
    private var teams : List.<Team> = new List.<Team>();
    private var players : Dictionary.<String,Player> = new Dictionary.<String,Player>();

    // TODO - set game mode when instantiating game
    private var mode : GameMode = GameMode.Team;
    private var status : String = "All good!";

    // Game Manager & scripts
    private var gameManager : GameObject;
    private var playerScript : PlayerScript;
    private var stateScript : StateScript;
    private var gameSetupScript : GameSetupScript;
    private var difficultyScript : DifficultyScript;

    public function Game(){
        gameManager = GameObject.Find("/GameManager");
        if(gameManager != null){
            playerScript = gameManager.GetComponent(PlayerScript);
            stateScript = gameManager.GetComponent(StateScript);
            gameSetupScript = gameManager.GetComponent(GameSetupScript);
            difficultyScript = gameManager.GetComponent(DifficultyScript);
        }

        teams.Add(new Team(0));

    }

    public function start(){
        stateScript.setGameState(GameState.Playing);
        for(var player : Player in players.Values){
            player.script.enabled = true;
        }
    }

    public function end(){
        stateScript.setGameState(GameState.Ended);
        for(var player : Player in players.Values){
            player.script.enabled = false;
        }
    }

    public function getState(){
        return stateScript.getGameState();
    }

    public function getIsVersus(): GameMode {
        return mode;
    }

    public function setIsVersus(gameMode : GameMode) {
        mode = gameMode;

        for(var team:Team in teams){
            team.clearAll();
        }

        if(mode == GameMode.Versus){
            //Add another team
            var changetoPlayer : Dictionary.<String,Player> = new Dictionary.<String,Player>();

            playerScript.getSelf().setTeamId(100);
            playerScript.getSelf().setCharacter(12);
            playerScript.getSelf().updateReadyStatus(false);

            for(var player : Player in players.Values){
                player.setTeam(100, null);
                player.setCharacter(12);
                player.updateReadyStatus(false);

                if(player.GetType != Player) {
                    changetoPlayer.Add(player.getId(), player);
                }
            }

            for(var player : Player in changetoPlayer.Values){
                changeToPlayer(player.getId(), player.getName(), player.getTeamId(), player.getNetworkPlayer());
            }

            teams.Add(new Team(1));
        } else {
              this.mode = GameMode.Team;
              playerScript.getSelf().setTeamId(0);
              playerScript.getSelf().setCharacter(12);

            //Remove second team
            for(var player : Player in players.Values){
                player.setTeam(0, getTeam(0));
                player.setCharacter(12);
                player.updateReadyStatus(false);
            }

            teams.Remove(getTeam(1));
        }
    }

    public function updateState(){
        if(stateScript.getGameState() == GameState.Playing){
            var deadTeams : int = 0;
            for(var team : Team in teams){
                if(!team.isAlive()){
                    deadTeams++;
                }
            }
            if(deadTeams == teams.Count){
                this.end();
            }
        }
    }

    public function getPlayerswoTeam() : Dictionary.<String, Player> {

        var playersWOTeam : Dictionary.<String, Player> = new Dictionary.<String, Player>();

        for(var player : Player in players.Values){

            if(player.getTeamId() == 100)
                playersWOTeam.Add(player.getId(), player);
        }

        return playersWOTeam;
    }

    public function getPlayers() : Dictionary.<String,Player>{
        return players;
    }

    public function getMode() : GameMode {
        return mode;
    }

    public function getTeam(i : int) : Team{
        if(i == 100) return null;

        return teams[i];
    }

    public function getTeams() : List.<Team>{
        return teams;
    }

    public function getLeadingTeam() : Team {
        if(mode == GameMode.Versus){
            if(teams[0].getDistance() > teams[1].getDistance()){
                return teams[0];
            }
            else{
                return teams[1];
            }
        }
        else{
            return teams[0];
        }
    }

    public function getTrailingTeam() : Team {
        if(mode == GameMode.Versus){
            if(teams[0].getDistance() < teams[1].getDistance()){
                return teams[0];
            }
            else{
                return teams[1];
            }
        }
        else{
            return teams[0];
        }
    }

    // server-only function, check composition of team(s), assign new player's role,
    // and return [the team, the role].
    public function getNewPlayerTeamAndRole() : Array{
        return [mode == GameMode.Versus ? 100 : 0, PlayerRole.Player];
    }

    public function addPlayer (name : String, teamId: int, networkPlayer:NetworkPlayer): Player {
        var player : Player = createPlayer(name, teamId, networkPlayer);
        players.Add(player.getId(), player);
        this.setTeam(player, teamId, networkPlayer);
        return player;
    }

    public function setTeam (player: Player, teamId:int, networkPlayer:NetworkPlayer) {

        if(teamId == 100){
            players[player.getId()].setTeam(teamId, null);
            player.setTeam(teamId, null);
        } else{
            player.setTeam(teamId, teams[teamId]);
            teams[teamId].addTeammate(player);
        }
    }

    public function removeTeam (player: Player, teamId:int,networkPlayer:NetworkPlayer) {
        player.setTeam(100, null);
        teams[teamId].removeTeammate(player, "Game Class");
        player.setCharacter(12);
    }

    public function addRunner(name:String, teamId:int, networkPlayer:NetworkPlayer) : Runner {
        var runner : Runner = createRunner(name, teamId, networkPlayer);
        players.Add(runner.getId(), runner);
        this.setTeam(runner, teamId, networkPlayer);
        return runner;
    }

    // TODO - if adding a commander never diverges from runners, combine into generic addPlayer method
    public function addCommander(name:String, teamId:int, networkPlayer:NetworkPlayer) : Commander {
        var commander : Commander = createCommander(name, teamId, networkPlayer);
        players.Add(commander.getId(), commander);
        this.setTeam(commander, teamId, networkPlayer);
        return commander;
    }


    public function removePlayer(id : String){
        var player = players[id];
        var teamId : int = player.getTeamId();
        Network.RemoveRPCs(player.getNetworkPlayer());
        Network.DestroyPlayerObjects(player.getNetworkPlayer());
        Debug.Log("Player '" + player.getName() + "' disconnected.");
        teams[teamId].removeTeammate(player, "Remove");
        players.Remove(id);
        if(stateScript.getGameState() != GameState.Uninitialized){
            // Handle disconnecting players
            // TODO - handle disconnecting players more elegantly
            if(!this.isValid()){
                this.end();
            }
            else if(!teams[teamId].isAlive()){
                this.end();
            }
        }
    }

    public function changeToRunner(playerId : String, name:String, teamId:int, character: int, netPlayer :NetworkPlayer) : Runner {
        var runner : Runner = createRunner(name, teamId, netPlayer);
        players[playerId] = runner;
        teams[teamId].getTeammates()[playerId] = runner;
        teams[teamId].addRunner(runner);
        runner.setCharacter(character);
        return runner;
    }

    public function changeToCommander(playerId : String, name:String, teamId:int, character: int,  netPlayer :NetworkPlayer) : Commander{
        var commander : Commander = createCommander(name, teamId, netPlayer);
        players[playerId] = commander;
        teams[teamId].getTeammates()[playerId] = commander;
        teams[teamId].addCommander(commander);
        commander.setCharacter(character);
        return commander;
    }

    public function changeToPlayer(playerId : String, name:String, teamId:int, netPlayer :NetworkPlayer) : Player{
        var player : Player = createPlayer(name, teamId, netPlayer);
        players[playerId] = player;
        player.setCharacter(12);
        return player;
    }

    // Checks for any errors in the game setup
    public function isValid() : boolean {

        var teamValid : boolean = true;
        var tempStatus : String = "";

        if(Config.VALIDATION_SKIP) {
            teamValid = true;
        } else {

            for(var team : Team in teams){
                if(team.isValid() != TeamStatus.Valid){
                    tempStatus = "Oh no! Team setup is wrong. Need 2 runners and 1 commander.";
                    teamValid = false;
                } else if(!team.isReady()) {
                    //If all memvers in team are not ready, we can't start game.
                   tempStatus = "All team members must be ready";
                   teamValid = false;
                }
            }
        }

        if(!teamValid) {
            setGameStatus(tempStatus);
            return false;
        }

        setGameStatus("All good! :)");
        return true;
    }

    // player is leaving game
    public function destroy(){

    }
    private function createPlayer (name:String, teamId: int, networkPlayer:NetworkPlayer):Player {

        var team:Team = null;

        if(teamId != 100) {
            team = teams[teamId];
        }

        return new Player(name, teamId, team, networkPlayer);
    }
    private function createRunner(name:String, teamId:int, networkPlayer:NetworkPlayer) : Runner {

        var team:Team = null;

        if(teamId != 100) {
            team = teams[teamId];
        }

        return new Runner(name, teamId, team, networkPlayer);
    }

    private function createCommander(name:String, teamId:int, networkPlayer:NetworkPlayer) : Commander{

        var team:Team = null;

        if(teamId != 100) {
           team = teams[teamId];
        }

        return new Commander(name, teamId, team, networkPlayer);
    }

    public function setGameStatus(status: String) {

        if(status != this.status){
            this.status = status;
            GameObject.Find("/GameManager").networkView.RPC("updateGameStatus", RPCMode.OthersBuffered, status);
        }
    }

    public function getGameStatus() : String {
        return status;

    }
}
