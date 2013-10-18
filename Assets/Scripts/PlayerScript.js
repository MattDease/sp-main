#pragma strict

private var playerName : String;

function Awake () {
    playerName = PlayerPrefs.GetString("playerName", "");
}

function getName(){
    return playerName;
}

function setName(name : String){
    PlayerPrefs.SetString("playerName", name);
    playerName = name;
}
