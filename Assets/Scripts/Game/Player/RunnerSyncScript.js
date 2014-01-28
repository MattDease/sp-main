#pragma strict

function OnSerializeNetworkView(stream : BitStream, info : NetworkMessageInfo) {
    var posX : float = 0;
    var posY : float = 0;
    if (stream.isWriting) {
        posX = gameObject.transform.position.x;
        posY = gameObject.transform.position.y;
        stream.Serialize(posX);
        stream.Serialize(posY);
    }
    else {
        stream.Serialize(posX);
        stream.Serialize(posY);
        gameObject.transform.position.x = posX;
        gameObject.transform.position.y = posY;
    }
}
