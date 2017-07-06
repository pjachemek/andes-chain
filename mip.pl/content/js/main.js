      function handleClick()
      {
    	  var startPoint = document.getElementById('begin-route').value
    	  var url = 'https://www.google.com/maps/embed/v1/place?key=AIzaSyCmGnRozsU9iiUNasUgVMmM134pb5FYNLE&q=' + startPoint;
    	  document.getElementById("wedding-iframe").src = url;
    	  document.getElementById("wedding-iframe").reload();
      return false;
      }