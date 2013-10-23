#pragma strict

private var isGui = true;

function Start () {

}

function Update () {

}


function OnGUI () {
    // Make a background box (Simple Example GUI), I know its ugly!
    if(isGui){
        GUI.Box (Rect (10,10,100,90), "Let's load things");

        // Make the first button. If it is pressed, Application.Loadlevel (1) will be executed
        if (GUI.Button (Rect (20,40,80,20), "Character")) {
            loadCharacter("Name", "SampleCharacter",Vector3(-50, 0, 0), Quaternion.identity );
        }

        if (GUI.Button (Rect (20,70,80,20), "Egg")) {
            createEgg();
        }

    }

}

function loadCharacter(modelName, url, position, rotation) {

    //Load a Character from the resource folder, set up its player controls

    var instance : GameObject = Instantiate(Resources.Load(url), position, rotation);

    //Add correpsonding components to the model
    instance.AddComponent(BoxCollider);
    instance.AddComponent(Rigidbody);

    //Set up anything specific about the model
    instance.name = modelName;
    instance.transform.localScale = Vector3(4, 4, 4);
    instance.GetComponent(BoxCollider).size = Vector3(5, 0.3, 5);

    var instanceTransform = instance.GetComponent(Transform);

    var controlsGameObject = new GameObject(modelName + "_Controls");
    controlsGameObject.AddComponent('playerGesture');
    var instanceControls  =  controlsGameObject.GetComponent(playerGesture);
    instanceControls.model = instanceTransform;

    isGui = false;
}

function createEgg() {
    var position : Vector3 = Vector3(0,0,0);
    var rotation  = Quaternion(0,0,0,0);
    var instance : GameObject = Instantiate(Resources.Load("egg"), position, rotation);
    instance.AddComponent(BoxCollider);
    instance.AddComponent(Rigidbody);
    instance.transform.localScale = Vector3(0.5, 0.5, 0.5);
    instance.transform.Rotate(0, 0, 90);
    instance.name = "egg";

}
