class GuiClasses {

		var offsetY30 = Screen.height * 0.30; //Move by 30% of the screen
	    var offsetY03 = Screen.height * 0.03; //Move by 3% of the screen
	    var offsetY40 = Screen.height * 0.43; //Move by 43% of the screen

	//class LocationSpot{
		var textureWidth :int = 0;
		var textureHeight :int = 0;

		enum Point {TopLeft, TopRight, BottomLeft, BottomRight, Center}
		var pointLocation: int;

		var offset: Vector2; //new location of texture

		function updateLocation(){

			switch(pointLocation){

				case Point.TopLeft:
					offset = new Vector2(0,0);
					break;

				case Point.Center:
					offset = new Vector2(Screen.width/2 - (textureWidth/2), Screen.height/2 - (textureHeight/2));
					break;

				case Point.TopRight:
					offset = new Vector2(Screen.width - textureWidth, 0);
					break;

				case Point.BottomRight:
					offset = new Vector2(Screen.width - textureWidth, Screen.height);
					break;

				case Point.BottomLeft:
					offset = new Vector2(0, Screen.height - textureHeight);
			}

			//Debug.Log(textureWidth);

		//}

	}

}