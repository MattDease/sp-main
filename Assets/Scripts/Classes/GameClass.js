#pragma strict

import System.Collections.Generic;

public class Game {
    private var teams : List.<Team> = new List.<Team>();
    private var players : Dictionary.<String,Player> = new Dictionary.<String,Player>();

    // TODO - set game mode when instantiating game
    private var mode : GameMode = GameMode.Team;

    // Game Manager & scripts
    private var gameManager : GameObject;
    private var playerScript : PlayerScript;
    private var stateScript : StateScript;
    private var gameSetupScript : GameSetupScript;
    private var difficultyScript : DifficultyScript;

    private var isVersus : boolean = true;

    public function Game(){
        gameManager = GameObject.Find("/GameManager");
        if(gameManager != null){
            playerScript = gameManager.GetComponent(PlayerScript);
            stateScript = gameManager.GetComponent(StateScript);
            gameSetupScript = gameManager.GetComponent(GameSetupScript);
            difficultyScript = gameManager.GetComponent(DifficultyScript);
        }

        if(isVersus){
            teams.Add(new Team(0));
            teams.Add(new Team(1));
            teams.Add(new Team(2));

        } else {
            teams.Add(new Team(teams.Count));
        }
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

    public function getPlayers() : Dictionary.<String,Player>{
        return players;
    }

    public function getTeam(i : int) : Team{
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

    // server-only function, check composition of team(s), assign new player's role,
    // and return [the team, the role].
    public function getNewPlayerTeamAndRole() : Array{
        //TODO implement fanciness
        return [0, PlayerRole.Runner];
    }

    public function addPlayer (name : String, networkPlayer:NetworkPlayer): Player {
        var player : Player = createPlayer(name, networkPlayer);
        players.Add(player.getId(), player);
        return player;
    }

    public function setTeam (player: Player, teamId:int, team:Team, networkPlayer:NetworkPlayer) {
        player.setTeam(teamId, teams[teamId]);
        teams[teamId].addTeammate(player);

    }

    public function removeTeam (player: Player, teamId:int, networkPlayer:NetworkPlayer) {
        player.setTeam(0, teams[0]);
        teams[teamId].removeTeammate(player.getId());
    }
    public function addRunner(name:String, teamId:int, networkPlayer:NetworkPlayer) : Runner {
        var runner : Runner = createRunner(name, teamId, networkPlayer);
        players.Add(runner.getId(), runner);
        return runner;
    }

    // TODO - if adding a commander never diverges from runners, combine into generic addPlayer method
    public function addCommander(name:String, teamId:int, networkPlayer:NetworkPlayer) : Commander {
        var commander : Commander = createCommander(name, teamId, networkPlayer);
        players.Add(commander.getId(), commander);
        return commander;
    }

    public function removePlayer(id : String){
        var player = players[id];
        Network.RemoveRPCs(player.getNetworkPlayer());
        Network.DestroyPlayerObjects(player.getNetworkPlayer());
        Debug.Log("Player '" + player.getName() + "' disconnected.");
        teams[player.getTeamId()].removeTeammate(id);
        players.Remove(id);
        if(stateScript.getGameState() != GameState.Uninitialized){
            // Handle disconnecting players
            // TODO - handle disconnecting players more elegantly
            if(!this.isValid()){
                this.end();
            }
        }
    }

    // Change player to the other role
    public function switchPlayerRole(player : Player){
        // createRunner/createCommander, set new value for id in player dictionary
    }

    // Move player to the other team
    public function switchPlayerTeam(player : Player){

    }

    // Toggle between GameMode.Team and GameMode.Versus
    public function switchMode(){

    }

    // Checks for any errors in the game setup
    public function isValid() : boolean {
        for(var team : Team in teams){
            if(team.isValid() != TeamStatus.Valid){
                return false;
            }
        }
        return true;
    }

    // player is leaving game
    public function destroy(){

    }
    private function createPlayer (name:String, networkPlayer:NetworkPlayer):Player {
        return new Player (name, networkPlayer);
    }
    private function createRunner(name:String, teamId:int, networkPlayer:NetworkPlayer) : Runner {
        return new Runner(name, teamId, teams[teamId], networkPlayer);
    }

    private function createCommander(name:String, teamId:int, networkPlayer:NetworkPlayer) : Commander{
        return new Commander(name, teamId, teams[teamId], networkPlayer);
    }
}
