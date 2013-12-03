#pragma strict

public var MenuScripts : GameObject;
public var GameManager : GameObject;

function Awake () {
    if(!GameObject.Find("/GameManager")){
        var manager : GameObject = Instantiate(GameManager);
        manager.name = "GameManager";
    }
    var menuScripts : GameObject = Instantiate(MenuScripts);
    menuScripts.name = "MenuScripts";
}
