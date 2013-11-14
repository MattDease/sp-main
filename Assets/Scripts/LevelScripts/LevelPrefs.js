#pragma strict

var levelID : int;


public enum levelDiff {
    easy,
    medium,
    hard
}

public var currentLevelDiff : levelDiff;

private var gameManager : GameObject;
private var difficultyScript : DifficultyScript;
//Don't know if I need this guy yet - maybe remove him.
private var segmentCount : int;

function Start () {
    gameManager = GameObject.Find("/GameManager");
    difficultyScript = gameManager.GetComponent(DifficultyScript);
    segmentCount = difficultyScript.getSegmentCount();


    //Set any specific level prefs based on levelID
    switch(levelID) {
        case 1:
            currentLevelDiff = levelDiff.easy;
        break;
        case 2:
            currentLevelDiff = levelDiff.medium;
        break;
        case 3:
            currentLevelDiff = levelDiff.hard;
        break;
        case 4:
            currentLevelDiff = levelDiff.easy;
        break;
        case 5:
            currentLevelDiff = levelDiff.medium;
        break;
        case 6:
            currentLevelDiff = levelDiff.medium;
        break;
        case 7:
            currentLevelDiff = levelDiff.hard;
        break;
        case 8:
            currentLevelDiff = levelDiff.easy;
        break;
        case 9:
            currentLevelDiff = levelDiff.easy;
        break;
        case 10:
            currentLevelDiff = levelDiff.hard;
        break;
        default:
            currentLevelDiff = levelDiff.easy;
        break;
    }
}

function Update () {

    //TODO: Add script to trigger enemies here
}
