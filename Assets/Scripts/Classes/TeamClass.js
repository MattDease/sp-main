#pragma strict

import System.Linq;
import System.Collections.Generic;

public class Team{
    public var runnerCreationCount : int = 0;

    private var teammates : Dictionary.<String,Player> = new Dictionary.<String,Player>();
    private var commander : Commander = null;
    private var runners : Dictionary.<String,Runner> = new Dictionary.<String,Runner>();
    private var activeRunners : Dictionary.<String,Runner> = new Dictionary.<String,Runner>();
    private var selectedCharacters : List.<int> = new List.<int>();
    private var egg : GameObject;

    private var id : int;
    private var alive : boolean = true;

    private var coinCount : int = 0;

    private var cachedDistance : float = 0;

    public function Team(id : int){
        this.id = id;
    }

    public function getName() : String {
        return Config.TEAM_NAME[this.id];
    }

    public function reset() {
        coinCount = 0;
        cachedDistance = 0;
        runnerCreationCount = 0;
        alive = true;
        for(var runner : Runner in runners.Values){
            runner.reset();
            activeRunners[runner.getId()] = runner;
        }
        if(commander){
            commander.reset();
        }
    }

    public function kill() {
        alive = false;
    }

    public function collectCoin() {
        coinCount++;
    }

    public function isAlive() : boolean {
        return alive;
    }

    public function isValid() : TeamStatus {
        if(Config.VALIDATION_SKIP){
            return TeamStatus.Valid;
        }

        if(commander == null){
            return TeamStatus.NoCommander;
        }
        if(runners.Count < 2){
            return TeamStatus.NeedsRunner;
        }
        var readyCount : int = 0;
        var commanderCount : int = 0;
        for(var player : Player in teammates.Values){
            if(player.GetType() == Player){
                return TeamStatus.NoCharacter;
            }
            if(player.GetType() == Commander){
                commanderCount++;
            }
            if(player.getReadyStatus()){
                readyCount++;
            }
        }
        if(commanderCount > 1){
            return TeamStatus.ManyCommanders;
        }
        if(readyCount < teammates.Count){
            return TeamStatus.NotReady;
        }

        return TeamStatus.Valid;
    }

    public function isReady() : boolean {

        for(var player : Player in teammates.Values){
            if(!player.getReadyStatus())
                return false;
        }

        return true;
    }

    public function getId() : int {
        return this.id;
    }

    public function setEgg(egg : GameObject){
        this.egg = egg;
    }

    public function getEgg() : GameObject{
        return this.egg;
    }

    public function getTeammates() : Dictionary.<String,Player> {
        return teammates;
    }

    public function getCommander() : Commander {
        return commander;
    }

   public function clearCommander()  {
        commander = null;
    }

    public function getRunners(aliveOnly : boolean) : Dictionary.<String,Runner> {
        return aliveOnly ? activeRunners : runners;
    }

    public function updateSelectedCharacters(selectedChar : int ) {
        selectedCharacters.Add(selectedChar);
    }

    public function removeSelectedCharacters(selectedChar : int ) {
        if(selectedChar != 12) {
            selectedCharacters.Remove(selectedChar);
        }
    }

    public function getSelectedCharacters() : List.<int> {
        return selectedCharacters;
    }

    public function getRandomRunner() : Runner {
        var index : int = Random.Range(0, runners.Keys.Count);
        var key : String = runners.Keys.ToArray()[index];
        return runners[key];
    }

    public function getClosestRunner(player : Player, forward : boolean) : Runner {
        var position : Vector3 = player.gameObject.transform.position;
        var closeRunner : Runner = null;
        var distanceX : float;
        for(var runner : Runner in runners.Values){
            if(runner.getId() != player.getId()){
                var dist : float = runner.getPosition().x - position.x;
                if(!distanceX || Mathf.Abs(dist) < distanceX){
                    if((dist >= 0 && forward) || (dist <= 0 && !forward)){
                        closeRunner = runner;
                        distanceX = dist;
                    }
                }
            }
        }
        return closeRunner;
    }

    public function addTeammate(player : Player){
        if(player.GetType() == Runner){
            runners.Add(player.getId(), player as Runner);
            activeRunners.Add(player.getId(), player as Runner);
        }

        if(player.GetType() == Commander){
            commander = player as Commander;
        }

        if(teammates.ContainsKey(player.getId())){
            teammates[player.getId()] = player;
        } else {
            teammates.Add(player.getId(), player);
        }

    }

    public function addRunner(player : Player){
        if(player.GetType() == Runner){
            runners[player.getId()] = player as Runner;
            activeRunners[player.getId()] = player as Runner;
        }
    }

    public function removeRunner(id : String) {
            runners.Remove(id);
            activeRunners.Remove(id);
    }

    public function addCommander (player: Player){
        commander = player as Commander;
    }
    public function killTeammate(id : String){
        activeRunners.Remove(id);
        if(activeRunners.Count == 0){
            this.kill();
        }
    }

    public function removeTeammate(player : Player, from: String){

        var id : String = player.getId();

        if(teammates[id].GetType() == Runner){
            runners.Remove(id);
            activeRunners.Remove(id);
            if(activeRunners.Count == 0){
                this.kill();
            }
        }
        if(teammates[id].GetType() == Commander){
            commander = null;
        }
        teammates.Remove(id);
    }

    public function clearAll() {
        selectedCharacters.Clear();
        teammates.Clear();
        runners.Clear();
        activeRunners.Clear();
        clearCommander();
    }

    public function getLeader() : Runner {
        var leader : Runner;
        for(var player : Player in teammates.Values){
            if(player.GetType() == Runner){
                var runner : Runner = player as Runner;
                if(runner.isAlive() && (!leader || runner.getDistance() > leader.getDistance())){
                    leader = runner;
                }
            }
        }
        if(leader){
            cachedDistance = leader.getDistance();
        }
        return leader;
    }

    public function getMVP() : Runner {

        var leader : Runner;
        for(var player : Player in teammates.Values){
            if(player.GetType() == Runner){
                var runner : Runner = player as Runner;
                if(!leader || runner.getDistance() > leader.getDistance()){
                    leader = runner;
                }
            }
        }

        return leader;

    }

    public function getStraggler() : Runner {
        var straggler : Runner;
        for(var player : Player in teammates.Values){
            if(player.GetType() == Runner){
                var runner : Runner = player as Runner;
                if(runner.isAlive() && (!straggler || runner.getDistance() < straggler.getDistance())){
                    straggler = runner;
                }
            }
        }
        return straggler;
    }

    public function getObserverCameraPosition() : Vector3 {
        var total : Vector2 = Vector2.zero;
        for(var runner : Runner in activeRunners.Values){
            total += runner.getPosition();
        }
        return total / activeRunners.Count;
    }

    public function getDistance() : float {
        var leader : Runner = this.getLeader();
        if(leader){
            return leader.getDistance();
        }
        else{
            return cachedDistance;
        }
    }

    public function getCoinCount() : int {
        return this.coinCount;
    }

    public function getPoints() : float {
        return (this.getDistance() *  10) * (this.getCoinCount() * 5);
    }

    public function ToString() : String {
        var str : String = "";
        str += "Team[" + this.id + "] ";
        str += "Teammate Count[" + this.teammates.Count + "] ";
        str += "Runner Count[" + this.runners.Count + "] ";
        str += "Active Runner Count[" + this.activeRunners.Count + "] ";
        str += "Selected Char Count[" + this.selectedCharacters.Count + "] ";
        return str;
    }

    // TODO add team validity check methods and gameplay methods.
}
