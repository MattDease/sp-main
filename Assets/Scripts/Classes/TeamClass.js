#pragma strict

import System.Linq;
import System.Collections.Generic;

// TODO implement this
public class Team{
    private var teammates : Dictionary.<String,Player> = new Dictionary.<String,Player>();
    private var commander : Commander;
    private var runners : Dictionary.<String,Runner> = new Dictionary.<String,Runner>();
    private var activeRunners : Dictionary.<String,Runner> = new Dictionary.<String,Runner>();

    private var alive : boolean = true;

    public function Team(){

    }

    public function isAlive() : boolean {
        return alive;
    }

    public function getTeammates() : Dictionary.<String,Player> {
        return teammates;
    }

    public function getCommander() : Commander {
        return commander;
    }

    public function getRunners(aliveOnly : boolean) : Dictionary.<String,Runner> {
        return aliveOnly ? activeRunners : runners;
    }

    public function addTeammate(player : Player){
        if(player.GetType() == Runner){
            runners.Add(player.getId(), player as Runner);
            activeRunners.Add(player.getId(), player as Runner);
        }
        if(player.GetType() == Commander){
            commander = player as Commander;
        }
        teammates.Add(player.getId(), player);
    }

    public function killTeammate(id : String){
        activeRunners.Remove(id);
        if(activeRunners.Count == 0){
            this.alive = false;
        }
    }

    public function removeTeammate(id : String){
        if(teammates[id].GetType() == Runner){
            runners.Remove(id);
            activeRunners.Remove(id);
        }
        if(teammates[id].GetType() == Commander){
            commander = null;
        }
        teammates.Remove(id);
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

    // TODO add team validity check methods and gameplay methods.
}
