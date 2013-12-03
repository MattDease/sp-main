#pragma strict

public var MenuScripts : GameObject;
public var GameManager : GameObject;
public var MenuCamera : GameObject;

function Awake () {
    var camera : GameObject = Instantiate(MenuCamera);
    camera.name = "Main Camera";
    if(!GameObject.Find("/GameManager")){
        var manager : GameObject = Instantiate(GameManager);
        manager.name = "GameManager";
    }
    var menuScripts : GameObject = Instantiate(MenuScripts);
    menuScripts.name = "MenuScripts";
}
