#pragma strict

import System.Collections.Generic;

public class Game {
    private var teams : List.<Team> = new List.<Team>();
    private var players : Dictionary.<String,Player> = new Dictionary.<String,Player>();

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

        teams.Add(new Team());
    }

    public function start(){
        stateScript.setGameState(GameState.Playing);
        for(var player : Player in players.Values){
            player.script.enabled = true;
        }
    }

    public function getPlayers() : Dictionary.<String,Player>{
        return players;
    }

    public function getTeam(i : int) : Team{
        return teams[i];
    }

    public function getTeams()  : List.<Team>{
        return teams;
    }

    // server-only function, check composition of team(s), assign new player's role,
    // and return [the team, the role].
    public function getNewPlayerTeamAndRole() : Array{
        //TODO implement fanciness
        return [0, PlayerRole.Runner];
    }

    public function addRunner(name:String, teamId:int, networkPlayer:NetworkPlayer) : Runner {
        var runner : Runner = createRunner(name, teamId, networkPlayer);
        players.Add(runner.getId(), runner);
        teams[runner.getTeamId()].addTeammate(runner);
        return runner;
    }

    // TODO - if adding a commander never diverges from runners, combine into generic addPlayer method
    public function addCommander(name:String, teamId:int, networkPlayer:NetworkPlayer) : Commander {
        var commander : Commander = createCommander(name, teamId, networkPlayer);
        players.Add(commander.getId(), commander);
        teams[commander.getTeamId()].addTeammate(commander);
        return commander;
    }

    public function removePlayer(id : String){
        var player = players[id];
        Network.RemoveRPCs(player.getNetworkPlayer());
        Network.DestroyPlayerObjects(player.getNetworkPlayer());
        Debug.Log("Player '" + player.getName() + "' disconnected.");
        teams[player.getTeamId()].removeTeammate(id);
        players.Remove(id);
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

    // player is leaving game
    public function destroy(){

    }

    private function createRunner(name:String, teamId:int, networkPlayer:NetworkPlayer) : Runner {
        return new Runner(name, teamId, teams[teamId], networkPlayer);
    }

    private function createCommander(name:String, teamId:int, networkPlayer:NetworkPlayer) : Commander{
        return new Commander(name, teamId, teams[teamId], networkPlayer);
    }
}
