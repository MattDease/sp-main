#pragma strict

public var MenuScripts : GameObject;
public var GameScripts : GameObject;
public var Gestures : GameObject;
public var GameLight : GameObject;

function Awake () {
    var light : GameObject = Instantiate(GameLight);
    light.name = "LightGroup";
    var gestures : GameObject = Instantiate(Gestures);
    gestures.name = "Gestures";
    var menuScripts : GameObject = Instantiate(MenuScripts);
    menuScripts.name = "MenuScripts";
    var gameScripts : GameObject = Instantiate(GameScripts);
    gameScripts.name = "GameScripts";
}
