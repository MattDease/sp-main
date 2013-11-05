#pragma strict


public var start : levelSegment;
public var next: levelSegment;
public var prev : levelSegment;

public var isStart : boolean = false;
public var addNext : boolean = false;
public var isCurrent : boolean = false;

function Awake() {

        if(isStart) {
            start = this;
            prev = this;
        }

}

function Start () {

}

function Update () {

if (Input.GetKeyDown ("space")) addNext = true;

    if(!next && addNext && isCurrent){
           // Set next to a randomly selected level segment
           loadRandomSegment();
           addNext = false;
           isCurrent = false;
        }

}

function loadRandomSegment() {

    //Load a Character from the resource folder, set up its player controls
    var modelName = "level_" + Random.Range(2,10);
    var url = "levelSegments/" + modelName;

    var position;

    if(isStart)  position = transform.position + Vector3(-782,-15,51); //Set to end of previous
    else  position = transform.position + Vector3(-620, 0, 0); //Set to end of previous

    var rotation = Quaternion.identity;
    var instance : GameObject = Instantiate(Resources.Load(url), position, rotation);

    instance.AddComponent('levelSegment');
    instance.AddComponent(BoxCollider);
    //Set up anything specific about the model
    instance.name = modelName;
    instance.tag = "levelSegment";
    instance.GetComponent(levelSegment).prev = this;
    instance.GetComponent(levelSegment).isCurrent = true;
}

