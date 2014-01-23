#pragma strict

// TODO implement this
public class Team{
    private var teammates : Dictionary.<String,Player> = new Dictionary.<String,Player>();

    // cache commonly used values
    private var runnerCount : int = 0;
    private var commanderCount : int = 0;

    public function Team(){

    }

    public function getTeammates() : Dictionary.<String,Player> {
        return teammates;
    }

    public function addTeammate(player : Player){
        if(player.GetType() == Runner){
            runnerCount++;
        }
        if(player.GetType() == Commander){
            commanderCount++;
        }
        teammates.Add(player.getId(), player);
    }

    public function removeTeammate(id : String){
        if(teammates[id].GetType() == Runner){
            runnerCount--;
        }
        if(teammates[id].GetType() == Commander){
            commanderCount--;
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

    // TODO add team validity check methods and gameplay methods.
}
