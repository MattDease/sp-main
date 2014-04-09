#pragma strict

import System.Collections.Generic;

public class Game {
    private var teams : List.<Team> = new List.<Team>();
    private var players : Dictionary.<String,Player> = new Dictionary.<String,Player>();

    private var mode : GameMode = GameMode.Team;
    private var status : String = "All good!";
    private var name : String = "";

    // Game Manager & scripts
    private var gameManager : GameObject;
    private var playerScript : PlayerScript;
    private var stateScript : StateScript;
    private var gameSetupScript : GameSetupScript;

    public function Game(){
        gameManager = GameObject.Find("/GameManager");
        if(gameManager != null){
            playerScript = gameManager.GetComponent(PlayerScript);
            stateScript = gameManager.GetComponent(StateScript);
            gameSetupScript = gameManager.GetComponent(GameSetupScript);
        }

        teams.Add(new Team(0));

    }

    public function start(){
        GameObject.Find("/Music").transform.GetComponent(AudioSource).Play();
        stateScript.setGameState(GameState.Playing);
        for(var player : Player in players.Values){
            player.script.enabled = true;
        }
    }

    public function reset(){
        stateScript.setGameState(GameState.Uninitialized);
        for(var team : Team in teams){
            team.reset();
        }
    }

    public function end(){
        if(getState() != GameState.Ended){
            GameObject.Find("/Music").transform.GetComponent(AudioSource).Stop();
            GameObject.Find("/GameScripts").GetComponent(SoundScript).playGameEnd();
            stateScript.setGameState(GameState.Ended);
            if(!playerScript.OBSERVER){
                playerScript.getSelf().gameObject.GetComponent(NetworkView).enabled = false;
            }
            for(var player : Player in players.Values){
                player.script.enabled = false;
                Util.Toggle(player.gameObject, false);
                if(player.gameObject.rigidbody){
                    player.gameObject.rigidbody.useGravity = false;
                }
            }
            var enemies : GameObject[] = GameObject.FindGameObjectsWithTag("enemy");
            for(var enemy : GameObject in enemies){
                Util.Toggle(enemy, false);
            }
        }
    }

    public function setName(name : String){
        this.name = name;
    }

    public function getName() : String {
        return name;
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

            for(var player : Player in players.Values){
                player.setTeam(100, null);
                player.setCharacter(12);
                player.updateReadyStatus(false);

                if(player.GetType != Player) {
                    changetoPlayer.Add(player.getId(), player);
                }

                if(Util.IsNetworkedPlayerMe(player)){
                    playerScript.setSelf(player);
                }
            }

            for(var player : Player in changetoPlayer.Values){
                changeToPlayer(player.getId(), player.getName(), player.getTeamId(), player.getNetworkPlayer());
            }

            teams.Add(new Team(1));
        } else {
              this.mode = GameMode.Team;

            //Remove second team
            for(var player : Player in players.Values){
                player.setTeam(0, getTeam(0));
                player.setCharacter(12);
                player.updateReadyStatus(false);

                if(Util.IsNetworkedPlayerMe(player)){
                    playerScript.setSelf(player);
                }
            }
            if(teams.Count > 1){
                teams.Remove(getTeam(1));
            }
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
        if(!players.ContainsKey(id)){
            Debug.Log("Player is id " + id + " does not exist.");
            return;
        }
        var player = players[id];
        var teamId : int = player.getTeamId();
        if(Network.isServer){
            Network.RemoveRPCs(player.getNetworkPlayer());
        }
        if(Util.IsNetworkedPlayerMe(player)){
            Network.DestroyPlayerObjects(player.getNetworkPlayer());
        }
        Debug.Log("Player '" + player.getName() + "' disconnected.");
        if(teamId != 100){
            teams[teamId].removeTeammate(player, "Remove");
        }
        players.Remove(id);
        if(stateScript.getGameState() != GameState.Uninitialized){
            // Handle disconnecting players
            // TODO - handle disconnecting players more elegantly
            if(!this.isValid()){
                this.end();
            }
            else if(teamId != 100 && !teams[teamId].isAlive()){
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

        for(var team : Team in teams){
            var status : TeamStatus = team.isValid();
            switch(status){
                case TeamStatus.NoCommander :
                setGameStatus(getStatusPrefix(team) + " needs a commander.");
                break;
                case TeamStatus.NeedsRunner :
                setGameStatus(getStatusPrefix(team) + " needs two runners.");
                break;
                case TeamStatus.ManyCommanders :
                setGameStatus(getStatusPrefix(team) + " can only have one commander.");
                break;
                case TeamStatus.NotReady :
                for(var player : Player in team.getTeammates().Values){
                    if(!player.getReadyStatus()){
                        setGameStatus(player.getName() + " is not ready.");
                        break;
                    }
                }
                break;
                case TeamStatus.NoCharacter :
                for(var player : Player in team.getTeammates().Values){
                    if(player.GetType() == Player){
                        setGameStatus(player.getName() + " has not selected a character.");
                        break;
                    }
                }
                break;
            }
            if(status != TeamStatus.Valid){
                return false;
            }
        }
        setGameStatus("Everyone is ready to start.");
        return true;
    }

    public function canRestart() : boolean {
        var threshold : int = Mathf.Round(players.Count * Config.RESTART_PERCENT);
        var votes : int = 0;
        for(var player : Player in players.Values){
            if(player.getRestartVote()){
                votes++;
            }
        }
        return votes >= threshold;
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

    private function getStatusPrefix(team : Team) : String {
        var prefix : String;
        if(mode == GameMode.Team){
            prefix = "Your team";
        }
        else{
            prefix = "Team " + team.getName();
        }
        return prefix;
    }

    public function setGameStatus(status: String) {
        this.status = status;
    }

    public function getGameStatus() : String {
        return status;

    }
}
