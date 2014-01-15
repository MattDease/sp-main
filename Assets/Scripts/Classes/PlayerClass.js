#pragma strict

// TODO rethink this class. for now, add whatever you need to it.
public class Player{
    public var name : String;
    public var isSelf : boolean;
    public var netPlayer : NetworkPlayer;
    public var id : String;
    public var gameObject : GameObject;
    public var controller : MonoBehaviour;
    // TODO support commander players & better way to store role...probably extend class
    public var isRunner : boolean = true;

    public function Player(name:String, networkPlayer:NetworkPlayer, isSelf:boolean){
        this.name = name;
        this.isSelf = isSelf;
        this.netPlayer = networkPlayer;
        this.id = networkPlayer.guid;
    }
}
