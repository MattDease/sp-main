#pragma strict

private var playerName : String;
private var timesPlayed : int = 0;
public var self : Player;
private var selectedCharacter : String = "0";

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

function setImage(characterName : String){
    selectedCharacter = characterName;
}

function getImage(){
    return selectedCharacter;
}
function getSelf(){
    return self;
}

function setSelf(obj : Player){
    self = obj;
}

function getTimesPlayed(){
    return timesPlayed;
}

function incrementTimesPlayed(){
    timesPlayed++;
    PlayerPrefs.SetInt("timesPlayed", timesPlayed);
}

function getDistance(){
    return self.gameObject.transform.position.x;
}
