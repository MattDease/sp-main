#pragma downcast

private var isGui = true;
public var mainCam : GameObject;

function Start() {
    mainCam = GameObject.FindWithTag("MainCamera");
}


function OnGUI () {
    // Make a background box (Simple Example GUI), I know its ugly!
    if(isGui){
        GUI.Box (Rect (10,200,100,60), "Let's load things");

        // Make the first button. If it is pressed, create the character
        if (GUI.Button (Rect (20,230,80,20), "Character")) {
            loadCharacter("Name", "bee",Vector3(-25, 1, 40), Quaternion.identity );
        }
    }

}

function loadCharacter(modelName : String, url: String, position: Vector3, rotation : Quaternion) {

    //Load a Character from the resource folder, set up its player controls
    createEgg();

    var instance : GameObject = Instantiate(Resources.Load(url), position, rotation);

    //Add correpsonding components to the model
    instance.AddComponent(CapsuleCollider);
    instance.AddComponent(Rigidbody);
    instance.AddComponent("PlayerLogic");

    //Set up anything specific about the model
    instance.name = modelName;
    instance.transform.localScale = Vector3(1.5, 1.5, 1.5);
    instance.GetComponent(CapsuleCollider).height = 20;
    instance.GetComponent(CapsuleCollider).radius = 8;
    instance.GetComponent(CapsuleCollider).center = Vector3(0, 18, 2);

    var instanceTransform = instance.GetComponent(Transform);

    var controlsGameObject = new GameObject(modelName + "_Controls");
    controlsGameObject.AddComponent('PlayerGesture');
    var instanceControls  =  controlsGameObject.GetComponent(PlayerGesture);
    instanceControls.model = instanceTransform;

    mainCam.AddComponent(SmoothFollow);
    mainCam.GetComponent(SmoothFollow).target = instanceTransform;

    isGui = false;
}

function createEgg() {
    var position : Vector3 = Vector3(0,0,0);
    var rotation : Quaternion  = Quaternion(0,0,0,0);
    var instance : GameObject  = Instantiate(Resources.Load("egg"), position, rotation);
    instance.AddComponent(BoxCollider);
    instance.AddComponent(Rigidbody);
    instance.transform.localScale = Vector3(2, 2, 2);
    instance.transform.Rotate(0, 0, 90);
    instance.name = "egg";
}
