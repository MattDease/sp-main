﻿#pragma strict

public class Player{
    private var name : String;
    private var teamId : int = 100;
    protected var team : Team;
    protected var id : String;
    private var networkPlayer : NetworkPlayer;
    public var gameObject : GameObject;
    public var script : MonoBehaviour;
    private var selectedCharacter : int = 11;
    private var isReady : boolean = false;
    public function Player(name:String, teamId:int, team:Team, networkPlayer:NetworkPlayer){
        this.name = name;
        this.teamId = teamId;
        this.team = team;
        this.networkPlayer = networkPlayer;
        this.id = networkPlayer.ToString();
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

    public function setTeam(teamId:int, team: Team) {
        this.teamId = teamId;
        this.team = team;
    }

    public function getTeam() : Team {
        return this.team;
    }

    public function getNetworkPlayer() : NetworkPlayer {
        return this.networkPlayer;
    }

    public function getPosition() : Vector3 {
        return this.gameObject.transform.position;
    }

    public function setCharacter(characterId : int){
        this.selectedCharacter = characterId;
    }

    public function getCharacter() : int {
        return this.selectedCharacter;
    }

    public function updateReadyStatus(status: boolean) {
        this.isReady = status;
    }

    public function getReadyStatus() : boolean {
        return this.isReady;
    }
}

public class Runner extends Player{
    public var controller : RunnerScript;

    private var alive : boolean = true;

    public function Runner(name:String, teamId:int, team:Team, networkPlayer:NetworkPlayer){
        super(name, teamId, team, networkPlayer);
    }

    public function reset() {
        Util.Toggle(this.gameObject, false);
        this.alive = true;
    }

    public function getDistance() : float {
        return this.gameObject.transform.position.x;
    }

    public function isAlive() : boolean {
        return this.alive;
    }

    public function kill() {
        Util.Toggle(this.gameObject, false);
        this.gameObject.transform.position.x = 0;
        this.gameObject.rigidbody.velocity = Vector3.zero;
        this.alive = false;
        this.team.killTeammate(this.id);
    }

    public function destroy() {
        UnityEngine.Object.Destroy(this.gameObject);
    }
}

public class Commander extends Player{
    // public var controller : CommanderScript;

    public function Commander(name:String, teamId:int, team:Team, networkPlayer:NetworkPlayer){
        super(name, teamId, team, networkPlayer);
    }
}
