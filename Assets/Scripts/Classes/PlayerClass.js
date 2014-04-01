#pragma strict

public class Player{
    private var name : String;
    private var teamId : int = 100;
    protected var team : Team;
    protected var id : String;
    private var networkPlayer : NetworkPlayer;
    public var gameObject : GameObject;
    public var script : MonoBehaviour;
    private var selectedCharacter : int = 12;
    private var isReady : boolean = false;
    private var wantsRestart : boolean = false;
    private var tutorialSigns : List.<String> = new List.<String>();

    public function Player(name:String, teamId:int, team:Team, networkPlayer:NetworkPlayer){
        this.name = name;
        this.teamId = teamId;
        this.team = team;
        this.networkPlayer = networkPlayer;
        this.id = networkPlayer.ToString();
    }

    public function reset(){
        wantsRestart = false;
        tutorialSigns = new List.<String>();
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

    public function setTeamId(teamId : int){
        this.teamId = teamId;
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

    public function setRestartVote(vote : boolean) {
        this.wantsRestart = vote;
    }

    public function getRestartVote() : boolean {
        return this.wantsRestart;
    }

     public function addTutorialSign(sign : String ) {
        tutorialSigns.Add(sign);
    }

    public function getSignWith(sign : String) : boolean {
        var count : int = 0;

        for (var tutSign: String in tutorialSigns) {
            if(tutSign == sign) ++count;
        }

        if(count >= Config.MAX_SIGN_COUNT) return true;
        return false;
    }

    public function ToString() : String {
        var str : String = "";
        str += "NAME[" + this.name + "] ";
        str += "ID[" + this.id + "] ";
        str += "TEAMID[" + this.teamId + "] ";
        str += "TYPE[" + this.GetType() + "] ";
        str += "CHARACTER[" + this.selectedCharacter + "] ";
        str+= "READY[" +this.isReady+"]";
        return str;
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
        super();
    }

    public function getDistance() : float {
        return this.gameObject.transform.position.x;
    }

    public function isAlive() : boolean {
        return this.alive;
    }

    public function kill() {
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

    public function reset(){
        super();
    }
}
