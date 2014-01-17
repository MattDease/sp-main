#pragma strict

// TODO implement this
public class Team{
    private var teammates : Dictionary.<String,Player> = new Dictionary.<String,Player>();

    public function Team(){

    }

    public function getTeammates() : Dictionary.<String,Player> {
        return teammates;
    }

    public function addTeammate(player : Player){
        teammates.Add(player.getId(), player);
    }

    public function removeTeammate(id : String){
        teammates.Remove(id);
    }

    // TODO add team validity check methods and gameplay methods.
}
