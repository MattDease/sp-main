#pragma downcast

public var isStart : boolean = false;
public var isCurrent : boolean = false;
public var addNext : boolean = false;

private var object : GameObject;
public var start : LevelSegment;
public var next: LevelSegment;
public var prev : GameObject;

private var gameManager : GameObject;
private var difficultyScript : DifficultyScript;
private var currentDifficulty;
private var segment : int;

var easy = [
    { "current": "easy", "previous": "easy", "next":"hard" },
    { "current": "easy", "previous": "easy", "next":"easy" },
    { "current": "easy", "previous": "easy", "next":"medium" },
    { "current": "easy", "previous": "medium", "next":"easy" },
    { "current": "medium", "previous": "easy", "next":"medium" },
    { "current": "medium", "previous": "easy", "next":"easy" }
];

 var medium = [
    { "current": "easy", "previous": "medium", "next":"hard" },
    { "current": "easy", "previous": "easy", "next":"hard" },
    { "current": "easy", "previous": "easy", "next":"medium" },
    { "current": "medium", "previous": "medium", "next":"easy" },
    { "current": "medium", "previous": "hard", "next":"easy" },
    { "current": "medium", "previous": "medium", "next":"medium" },
    { "current": "hard", "previous": "medium", "next":"medium" },
    { "current": "hard", "previous": "medium", "next":"easy" }
];

 var hard = [
    { "current": "easy", "previous": "easy", "next":"hard" },
    { "current": "easy", "previous": "medium", "next":"hard" },
    { "current": "medium", "previous": "easy", "next":"hard" },
    { "current": "medium", "previous": "hard", "next":"easy" },
    { "current": "medium", "previous": "medium", "next":"medium" },
    { "current": "medium", "previous": "medium", "next":"easy" },
    { "current": "hard", "previous": "medium", "next":"easy" },
    { "current": "hard", "previous": "medium", "next":"medium" }

];

var expert = [
    { "current": "hard", "previous": "easy", "next":"hard" },
    { "current": "hard", "previous": "medium", "next":"hard" },
    { "current": "hard", "previous": "hard", "next":"medium" },
    { "current": "medium", "previous": "easy", "next":"hard" },
    { "current": "medium", "previous": "hard", "next":"hard" },
    { "current": "medium", "previous": "hard", "next":"easy" },
    { "current": "easy", "previous": "hard", "next":"easy" },
    { "current": "easy", "previous": "medium", "next":"hard" }

];

var easyLevels : int[] = [1,4,8,9];
var mediumLevels : int[] = [2,5,6];
var hardLevels : int[] = [3,7,10];


function Awake() {
    if(isStart) {
        start = this;
        prev = gameObject;
    }

    /*Set up trigger on level, we check to see if the player hits this trigger
    is yes, we load the next level */
    var box : BoxCollider = gameObject.AddComponent(BoxCollider);
    box.isTrigger = true;
    box.size = new Vector3(10, 300 , 105);
    box.center = new Vector3(-400, 120, 52);
}

function Start () {
    gameManager = GameObject.Find("/GameManager");
    difficultyScript = gameManager.GetComponent(DifficultyScript);
    currentDifficulty = difficultyScript.getCurrentDifficulty().ToString();
    segment = difficultyScript.getSegmentCount();
}

function Update () {

    currentDifficulty = difficultyScript.getCurrentDifficulty().ToString();

    if(!next && addNext && isCurrent){
        if(currentDifficulty == "tutorial") segment = segment + 1;
        else segment = levelLogic();

        loadRandomSegment(segment);
        addNext = false;
        isCurrent = false;
    }
}

function loadRandomSegment(segment : int ) {

    //Check to see if segment was selected properly, if not just randomly choose one
    if(segment == null || segment == 0) segment = Random.Range(2,10);

    //Load a level from the resource folder, set up its player controls
    var modelName = "level_" + segment;
    var url = "levelSegments/" + modelName;

    var position : Vector3 ;
    position = this.transform.position + Vector3(-624, 0, 0); //Set to end of previous

    var rotation : Quaternion = Quaternion.identity;
    var instance : GameObject = Instantiate(Resources.Load(url), position, rotation);

    instance.AddComponent(MeshCollider);
    instance.AddComponent('LevelSegment');
    instance.AddComponent('LevelPrefs');

    //Set up anything specific about the model
    instance.name = modelName;
    instance.tag = "levelSegment";
    instance.GetComponent(LevelSegment).prev = gameObject;
    instance.GetComponent(LevelSegment).isCurrent = true;
    instance.GetComponent(LevelPrefs).levelID = segment;

    //Double check if prev is not this (the start prev is set to this) Delete prev is not this.
    if(prev != this && !isStart) Destroy(prev);

    //Set segment count on the difficultly script to increase
    difficultyScript.setSegmentCount(difficultyScript.getSegmentCount() + 1);
}

function levelLogic() {
    var currentLevel = gameObject.GetComponent(LevelPrefs).levelID;
    var currentLevelDif = gameObject.GetComponent(LevelPrefs).currentLevelDiff;

    var prevLevel = prev.GetComponent(LevelPrefs).levelID;
    var prevLevelDif = prev.GetComponent(LevelPrefs).currentLevelDiff;

    var currentGameDif = currentDifficulty;

    /*Based on the current level, its previous level and the difficulty of the game,
    determine what level we should load next.

    Need to do a look up based on current level dif, previous level dif and current level ID.
    The look up will grab the two previous difficulties and randomly select a level that fits into the next selected difficulty.
    If the randomly selected level is the same as the current, then pick again!
    */
    var next = getObjWhenPropertyEquals(prevLevelDif, currentLevelDif);
    return next;

}

function getObjWhenPropertyEquals(prev, curr){

    var nextDif : String;
    var nextLevel : int;
    var rand : int;

    switch(currentDifficulty){
        case "easy":
            for(var i = 0; i < easy.length; i++){
                if(prev.ToString() == easy[i]["previous"] && curr.ToString() == easy[i]["current"])
                    nextDif = easy[i]["next"];
            }
        break;
        case "medium":
         for(var j = 0; j < medium.length; j++){
                if(prev.ToString() == medium[j]["previous"] && curr.ToString() == medium[j]["current"])
                    nextDif = medium[j]["next"];
            }
        break;
        case "hard":
         for(var k = 0; k < hard.length; k++){
                if(prev.ToString() == hard[k]["previous"] && curr.ToString() == hard[k]["current"])
                    nextDif = hard[k]["next"];
            }
        break;
        case "expert":
         for(var l = 0; l < expert.length; l++){
                if(prev.ToString() == expert[l]["previous"] && curr.ToString() == expert[l]["current"])
                    nextDif = expert[l]["next"];
            }
        break;
    }

    if(nextDif == "easy") {
        rand = Random.Range(1, easyLevels.length);
        nextLevel = easyLevels[rand];
    } else if(nextDif == "medium") {
        rand = Random.Range(1, mediumLevels.length);
        nextLevel = mediumLevels[rand];
    } else {
        rand = Random.Range(1, hardLevels.length);
        nextLevel = hardLevels[rand];
    }

    return nextLevel;
}

function OnTriggerEnter(other : Collider) {
  addNext = true;
}

