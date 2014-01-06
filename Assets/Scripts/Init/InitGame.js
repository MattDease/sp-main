#pragma strict

public var MenuScripts : GameObject;
public var Gestures : GameObject;
public var PlayerGestures : GameObject;
public var StartLevel : GameObject;
public var GameCamera : GameObject;
public var Light : GameObject;

function Awake () {
    var camera : GameObject = Instantiate(GameCamera);
    camera.name = "MainCamera";
    var light : GameObject = Instantiate(Light);
    light.name = "DirectionalLight";
    // var gestures : GameObject = Instantiate(Gestures);
    // gestures.name = "Gestures";
    // var playerGestures : GameObject = Instantiate(PlayerGestures);
    // playerGestures.name = "PlayerGestures";
    var menuScripts : GameObject = Instantiate(MenuScripts);
    menuScripts.name = "MenuScripts";
    // var level : GameObject = Instantiate(StartLevel);
    // level.name = "level_1";
}
