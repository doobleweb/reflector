module.exports = function convert (keys, values) {
  var reverse = { }
  var full = { }
  var i

  for (i = keys.length; i--;) {
    full[keys[i].toUpperCase()] = values[i].toUpperCase()
    full[keys[i]] = values[i]
  }

  for (i in full) {
    reverse[full[i]] = i
  }

  return {
    decideLang: function (str, choice) {
      if (choice == true){ //translate to hebrew
        //res.send(he.fromEn(str));


      return str.replace(/./g, function (ch) {
            return full[ch] || ch
          })
      }
      else if (choice == false) { // translare to English
      //  res.send(he.toEn(str));

        return str.replace(/./g, function (ch) {
            return reverse[ch] || ch
          })
      }
      else if (choice == null)  //that means that no flag was sent and the program should decide on its own which languge to translate to
      {
        //console.log('');
        var enCount = 0;
        var heCount = 0;
        for (var i=0;i<str.length;i++)
        {
          var uni = str.charCodeAt(i);   ///get unicode value of specific chracter an=t index i
          if ((uni >= 65 && uni <= 90) || (uni >=97 && uni <=122 ))
          { // check if unicode is in english letters range
            enCount++;
          }
          else if (uni >= 1488 && uni <= 1514)
          { //check if unicode is in hebrew letters range
            heCount++;
          }
        }

        if (heCount >= enCount) {   //more hebrew letters than english
        //  res.send(he.fromEn(str)); //translte to Hebrew

            return str.replace(/./g, function (ch) {
              return reverse[ch] || ch
            })
      }  else if (heCount < enCount) {  //more english letters than hebrew
        //  res.send(he.toEn(str));   //translte to English

            return str.replace(/./g, function (ch) {
              return full[ch] || ch
            })
        // else (heCount == enCount)
        //   res.send('could not decide which language to translate to (hebrew letters and english letters are equal) ' + heCount + ':' + enCount)
      }}

      else if (choice!=false && choice!=true){
        console.log('error');
      }
},

    fromEn: function (str) {
      return str.replace(/./g, function (ch) {
        return full[ch] || ch
      })
    },
    toEn: function (str) {
      return str.replace(/./g, function (ch) {
        return reverse[ch] || ch
      })
    }
  }
}
