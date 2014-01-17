#pragma strict

public class Player{
    private var name : String;
    private var self : boolean;
    private var id : String;
    private var networkPlayer : NetworkPlayer;
    public var gameObject : GameObject;

    public function Player(name:String, networkPlayer:NetworkPlayer, self:boolean){
        this.name = name;
        this.self = self;
        this.networkPlayer = networkPlayer;
        this.id = networkPlayer.guid;
    }

    public function getName() : String {
        return this.name;
    }

    public function getId() : String {
        return this.id;
    }

    public function getNetworkPlayer() : NetworkPlayer {
        return this.networkPlayer;
    }

    public function isSelf() : boolean {
        return this.self;
    }
}

public class Runner extends Player{
    public var controller : RunnerScript;

    public function Runner(name:String, networkPlayer:NetworkPlayer, self:boolean){
        super(name, networkPlayer, self);
    }
}

public class Commander extends Player{
    // public var controller : CommanderScript;

    public function Commander(name:String, networkPlayer:NetworkPlayer, self:boolean){
        super(name, networkPlayer, self);
    }
}
