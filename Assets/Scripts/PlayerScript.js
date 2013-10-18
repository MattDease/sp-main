#pragma strict

private var playerName : String;
private var timesPlayed : int = 0;

function Awake () {
    playerName = PlayerPrefs.GetString("playerName", "");
    timesPlayed = PlayerPrefs.GetInt("timesPlayed", 0);
}

function getName(){
    return playerName;
}

function setName(name : String){
    PlayerPrefs.SetString("playerName", name);
    playerName = name;
}

function getTimesPlayed(){
    return timesPlayed;
}

function incrementTimesPlayed(){
    timesPlayed++;
    PlayerPrefs.SetInt("timesPlayed", timesPlayed);
}
