(() => {

  let drawCircle = (x,y,r) => 
	`M 0,0 V ${screen.width} h ${screen.height} V 0 Z 
          m ${x},${y} 
          a ${r},${r} 0 0 1 ${r},${r}
            ${r},${r} 0 0 1 -${r},${r}
            ${r},${r} 0 0 1 -${r},-${r}
            ${r},${r} 0 0 1 ${r},-${r} z`


  let viewport = (height,width, x,y,r) => `<svg
    xmlns:dc="http://purl.org/dc/elements/1.1/"
    xmlns:cc="http://creativecommons.org/ns#"
    xmlns:rdf="http://www.w3.org/1999/02/22-rdf-syntax-ns#"
    xmlns:svg="http://www.w3.org/2000/svg"
    xmlns="http://www.w3.org/2000/svg"
    xmlns:xlink="http://www.w3.org/1999/xlink"
    width="${width}px"
    height="${height}px"
    viewBox="0 0 ${width} ${height}"
    version="1.1"
    id="vp">
    <g
      inkscape:label="Layer 1"
      inkscape:groupmode="layer"
      id="layer1">
      <image
        y="0"
        x="0"
        id="image4553"
        xlink:href="https://d3qu30dwu5gsq5.cloudfront.net/58bab45be4b04b375945f683.jpg"
        preserveAspectRatio="none"
        height="${height}"
        width="${width}" />
      <path
        style="fill:#000000;fill-opacity:1;stroke-width:0.36603221"
        d="M 0,0 V ${height} h ${height} V 0 Z 
            m ${x},${y} 
            a ${r},${r} 0 0 1 ${r},${r}
              ${r},${r} 0 0 1 -${r},${r}
              ${r},${r} 0 0 1 -${r},-${r}
              ${r},${r} 0 0 1 ${r},-${r} z"
        id="rect3684"/>
    </g>
  </svg>`

  class CircleView {
    
    constructor() {
      let [lastX,lastY] = [0,0]
      let $viewport = document.createElement('div')
      $viewport.innerHTML = $viewport.innerHTML = viewport(screen.height,screen.width,screen.width/2,(screen.height/2)-150,150)
      let $svg = $viewport.firstChild
      let $path = $svg.querySelector('path')
      let $image = $svg.querySelector('image')

      this.$el = $viewport

      let hammeronsvg = new Hammer($svg,{})
      hammeronsvg.get('pan').set({direction: Hammer.DIRECTION_ALL })
      hammeronsvg.get('pinch').set({ enable: true });

      hammeronsvg.on('panmove', event => {
        requestAnimationFrame( _ => {
          $image.setAttribute('x', lastX+event.deltaX)
          $image.setAttribute('y', lastY+event.deltaY)
        })
      })

      hammeronsvg.on('panend', event => {
        //console.log([event.center.x - lastX,event.center.y - lastY]);
        [lastX,lastY] = [event.deltaX,event.deltaY]
      })

      hammeronsvg.on('pinchin', event => {
        requestAnimationFrame( _ => {
          //console.log(lastX + " " + lastY)
          const circle = drawCircle(lastX+event.deltaX, lastY +event.deltaY, 100)
          $path.setAttribute('d', circle)
        })
      })
    }

    render () {
      return this.$el
    }
  }

  const circleView = new CircleView ()
  document.body.appendChild(circleView.render())
  
})()



