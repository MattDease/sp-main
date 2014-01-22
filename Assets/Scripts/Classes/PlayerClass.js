#pragma strict

public class Player{
    private var name : String;
    private var teamId : int;
    private var team : Team;
    private var id : String;
    private var networkPlayer : NetworkPlayer;
    public var gameObject : GameObject;

    public function Player(name:String, teamId:int, team:Team, networkPlayer:NetworkPlayer){
        this.name = name;
        this.teamId = teamId;
        this.team = team;
        this.networkPlayer = networkPlayer;
        this.id = networkPlayer.guid;
    }

    public function getName() : String {
        return this.name;
    }

    public function getId() : String {
        return this.id;
    }

    public function getTeamId() : int {
        return this.teamId;
    }

    public function getTeam() : Team {
        return this.team;
    }

    public function getNetworkPlayer() : NetworkPlayer {
        return this.networkPlayer;
    }
}

public class Runner extends Player{
    public var controller : RunnerScript;

    public function Runner(name:String, teamId:int, team:Team, networkPlayer:NetworkPlayer){
        super(name, teamId, team, networkPlayer);
    }
}

public class Commander extends Player{
    // public var controller : CommanderScript;

    public function Commander(name:String, teamId:int, team:Team, networkPlayer:NetworkPlayer){
        super(name, teamId, team, networkPlayer);
    }
}
