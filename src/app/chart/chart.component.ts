import {
  Component,
  OnInit,
  AfterViewInit,
  OnChanges,
  OnDestroy,
  ViewChild,
  ChangeDetectionStrategy,
  Input,
} from '@angular/core';

import { NgScrollbar } from 'ngx-scrollbar';
import { Subscription } from 'rxjs';
import { map } from 'rxjs/operators';

import * as d3 from 'd3-selection';
import * as d3Scale from 'd3-scale';
import * as d3Array from 'd3-array';
import * as d3Axis from 'd3-axis';

@Component({
  selector: 'chart',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './chart.component.html'
})

export class ChartComponent implements OnInit, AfterViewInit, OnChanges, OnDestroy {
  @Input() data: ChartData[];
  @Input() changes: string;

  @ViewChild(NgScrollbar) scrollbarRef: NgScrollbar;

  width: number = 0;
  height: number = 0;
  x: any;
  y: any;
  a: any;
  b: any;
  svg: any;
  facts: number[] = [];
  pressed: boolean;
  selectedTemp: number[] = [];
  selected: number[] = [];
  scrollSubscription: Subscription = Subscription.EMPTY;

  constructor() {}

  ngOnInit() {}

  ngOnChanges() {
        this.getAllFacts();

        this.width = this.data.length * 60;
        this.height = 300;

        if(this.svg) {
          this.svg.remove();
        }
        this.initSvg();
        this.initAxis();
        this.drawBars();
        this.drawAxis();
        this.drawLines();

        this.selectedTemp = this.selected;
        this.hoverBars(true);
        this.pressed = false;
        this.selectedTemp = [];

        let position = Number(d3.select("ng-scrollbar").attr('left'));
        d3.select(".axis_y")
          .attr('transform', 'translate(' + (35 + position) + ',0)');

        setTimeout(() =>{
          (d3.select('.ng-scrollbar-track').node() && !d3.select('.ng-scrollbar-track .scrollbar-bg').node()) ? this.addScrollbarTrack() : null;
        }, 0);
  }

  addScrollbarTrack(){
    d3.select('.ng-scrollbar-track')
      .insert("div",":first-child")
      .attr("class", 'scrollbar-bg')
      .style("width", '100%')
      .style("height", "2px")
      .style("background", "#9393a8")
      .style("position", "absolute")
      .style("margin-left", "-3px")
      .style("margin-top", "2px")
  }

  ngAfterViewInit(){

    this.scrollSubscription = this.scrollbarRef.scrolled.pipe(
      map((event: any) => {

        d3.select(".axis_y")
          .attr('transform', 'translate(' + (event.target.scrollLeft + 35) + ',0)')


        d3.select('ng-scrollbar')
          .attr('left', event.target.scrollLeft)
      })
    ).subscribe();
  }

  initSvg() {
    this.svg = d3.select('.chart_container')
      .append('svg')
      .attr('width', (this.width+50) + 'px')
      .attr('height', '100%')
      .attr('preserveAspectRatio', 'none')
      .attr('viewBox', '0 -35 ' + (this.width+50) + ' ' + (this.height+150))

    this.svg.append('g')
      .attr('class', 'chart_content')
      .attr('transform', 'translate(30,0)')
      .on("mouseover", (event) => {
        if(this.pressed) {
          this.hoverBars(true);
          if (event.target.id) {
            this.selectedTemp.push(Number(event.target.id));
          }
        }
      })
      .on("mousedown", (event) => {
        this.hoverBars(false);
        this.pressed = true;
        if(event.target.id) {
          this.selectedTemp.push(Number(event.target.id));
        }
      })
      .on("mouseup", () => {
        if(this.pressed) {
          this.pressed = false;
          this.selectedTemp = [];

          if(this.selected.length>0) {
            console.log(this.selected)
          }
        }
      })

    this.svg.append('g')
      .attr('class', 'chart_axis')

    d3.select('.chart_content')
      .append('g')
      .attr('class', 'chart_bars_bg')

    d3.select('.chart_content')
      .append('g')
      .attr('class', 'chart_bars')

    d3.select('.chart_content')
      .append('g')
      .attr('class', 'chart_points')

    d3.select('.chart_content')
      .append('g')
      .attr('class', 'chart_lines')

    d3.select('.chart_axis')
      .append('g')
      .attr('class', 'axis_x')
      .attr('transform', 'translate(30,0)')

    d3.select('.chart_axis')
      .append('g')
      .attr('class', 'axis_y')
      .attr('transform', 'translate(35,0)')

  }

  initAxis() {
    this.x = d3Scale.scaleBand().range([10, this.width]).padding(.1);
    this.x.domain(this.data.map((d) => d.date));

    this.y = d3Scale.scaleLinear().range([this.height, 0]);
    this.y.domain([0, d3Array.max(this.facts, (d) => d)+2]);

    this.a = d3Scale.scaleBand().range([10, this.width]).paddingOuter(.05)
    this.a.domain(this.data.map((d) => d.date));

    this.b = d3Scale.scaleBand().range([10, this.width]);
    this.b.domain(this.data.map((d) => d.date));

  }

  drawAxis() {
    this.svg.append("marker")
      .attr("id", "triangle_s")
      .attr("refX", 0)
      .attr("refY", 3)
      .attr("markerWidth", 10)
      .attr("markerHeight", 10)
      .attr("markerUnits","userSpaceOnUse")
      .attr("orient", "auto")
      .append("path")
      .attr("d", "M 0 0 6 3 0 6 1 3")
      .style("fill", "#9393a8");


    this.svg.append("marker")
      .attr("id", "triangle_m")
      .attr("refX", -20)
      .attr("refY", 5)
      .attr("markerWidth", 10)
      .attr("markerHeight", 10)
      .attr("markerUnits","userSpaceOnUse")
      .attr("orient", "auto")
      .append("path")
      .attr("d", "M 0 0 10 5 0 10 2 5")
      .style("fill", "#9393a8");

    d3.select('.axis_x')
      .append('rect')
      .attr("fill", "none")
      .attr('width', this.width)
      .attr('height', 27)
      .attr("stroke", "#9393a8")
      .attr('x', 0)
      .attr('y', this.height)

    d3.select('.axis_x')
      .append('g')
      .attr('transform', 'translate(0,' + this.height + ')')
      .call(d3Axis.axisBottom(this.x))

    let width = Number(d3.select(".chart_bars rect").attr('width'));
    let height = Number(d3.select(".axis_x rect").attr('height'));

    d3.select('.axis_x')
      .select('g')
      .selectAll('.tick')
      .data(this.data)
      .attr('id', (d) => d.date)
      .insert("rect",":first-child")
      .attr('width', width)
      .attr('height', height-height/3)
      .attr("fill", "none")
      .attr('x', -width/2)
      .attr('y', (height/3)/2)

    d3.select('.axis_x')
      .append("line")
      .attr("x1", this.width)
      .attr("x2", this.width)
      .attr("y1", this.height)
      .attr("y2", this.height+height)
      .attr("stroke", "#646883")
      .attr("stroke-width", "2")

    d3.select('.axis_x')
      .append("line")
      .attr("x1", this.width)
      .attr("x2", this.width)
      .attr("y1", this.height)
      .attr("y2", this.height)
      .attr("stroke-width", 0)
      .attr("marker-end", "url(#triangle_s)");

    d3.select('.axis_x')
      .append("line")
      .attr("x1", this.width)
      .attr("x2", this.width)
      .attr("y1", this.height+27)
      .attr("y2", this.height+27)
      .attr("stroke-width", 0)
      .attr("marker-end", "url(#triangle_s)");

    d3.select('.axis_y')
      .append('rect')
      .attr('class', 'axis_y_line')
      .attr("fill", "#646883")
      .attr('width', 50)
      .attr('height', this.height+50)
      .attr("stroke", "#9393a8")
      .attr('stroke-dasharray', '0,50,' + (this.height+50) + ',460')
      .attr('x', -50)
      .attr('y', -22.5)

    d3.select('.axis_y')
      .append('g')
      .call(d3Axis.axisLeft(this.y).ticks(3))

    d3.select('.axis_y')
      .append("line")
      .attr("x1", 0)
      .attr("x2", 0)
      .attr("y1",1)
      .attr("y2", 0)
      .attr("stroke-width", 0)
      .attr("marker-end", "url(#triangle_m)");
  }

  drawBars() {
    d3.select('.chart_bars_bg')
      .selectAll('rect')
      .data(this.data)
      .enter().append('rect')
      .attr('id', (d) => d.date)
      .attr('x', (d) => this.b(d.date))
      .attr('y', -30)
      .attr('width', this.b.bandwidth())
      .attr('fill', 'transparent')
      .attr('height', this.height+30)


    d3.select('.chart_bars')
      .selectAll('.chart_bar')
      .data(this.data)
      .enter().append('rect')
      .attr('class', 'chart_bar')
      .attr('id', (d) => d.date)
      .attr('x', (d) => this.x(d.date))
      .attr('y', 0)
      .attr('width', this.x.bandwidth())
      .attr('fill', 'none')
      .attr('height', this.height);

    this.data.forEach(d => {

      let points = d3.select('.chart_points')
        .append('g')
        .attr('class', 'chart_bar_points')
        .attr('id', d.date)

      points.selectAll('.chart_bar_points g')
        .data(d.fact)
        .enter().append('rect')
        .attr('id', d.date)
        .attr('x', this.x(d.date) + this.x.bandwidth()/3)
        .attr('y', (fact) => this.y(fact)+2)
        .attr('width', this.x.bandwidth() - this.x.bandwidth()/1.5)
        .attr('fill', '#757b96')
        .attr('height', this.height/this.getMax(this.facts)/2.5 );

    })

  }

  drawLines() {
    d3.select('.chart_lines')
      .selectAll('.chart_line_horizontal')
      .data(this.data)
      .enter().append('line')
      .attr('class', 'chart_line_horizontal')
      .attr('id', (d) => d.date)
      .attr("stroke", "#c4d5ef")
      .attr('x1', (d) => this.a(d.date))
      .attr('x2', (d) => this.a(d.date) + this.a.bandwidth())
      .attr('y1', (d) => this.y(d.plan))
      .attr('y2', (d) => this.y(d.plan))
      .attr('stroke-width', '1.5')
      .attr('stroke-dasharray', '3 3')

    d3.select('.chart_lines')
      .selectAll('.chart_line_vertical')
      .data(this.data)
      .enter().append('line')
      .attr('class', 'chart_line_vertical')
      .attr('id', (d) => d.date)
      .attr("stroke", "#c4d5ef")
      .attr('x1', (d) => this.a(d.date) + this.a.bandwidth())
      .attr('x2', (d) => this.a(d.date) + this.a.bandwidth())
      .attr('y1', (d) => this.y(d.plan))
      .attr('y2', (d) => this.getNextDate(d) ? this.y(this.getNextDate(d).plan) : this.y(d.plan))
      .attr('stroke-width', '1.5')
      .attr('stroke-dasharray', '3 3')

  }

  getAllFacts() {
    this.data.forEach(d => {
      this.facts = this.facts.concat(d.fact.filter(item => {
        return this.facts.indexOf(item) === -1;
      }));

      if(this.facts.filter(x => x==d.plan).length==0) {
        this.facts.push(d.plan)
      }
    })

    this.facts.sort((a, b) => {
      return a - b;
    });
  }

  getNextDate(d: ChartData){
    return this.data.filter(x => Number(x.date) == Number(d.date)+1)[0];
  }

  getMax(array: number[]){
    return array.reduce((max, val) => max > val ? max : val);
  }

  getMin(array: number[]){
    return array.reduce((min, val) => min < val ? min : val);
  }

  hoverBars(action: boolean){
    d3.selectAll('.hover_line').remove();
    this.selected = [];
    this.selectedTemp = [...new Set(this.selectedTemp)].sort();

    if(action && this.selectedTemp.length>1) {

      for (let i = this.getMin(this.selectedTemp); i <= this.getMax(this.selectedTemp); i++) {
        d3.selectAll('.chart_bars .chart_bar[id="' + i + '"]')
          .attr('fill', '#666e8b')

        d3.selectAll('.chart_bar_points rect[id="' + i + '"]')
          .attr('fill', '#929eba')

        d3.selectAll('.axis_x g .tick[id="' + i + '"] text')
          .attr('fill', '#fff')

        d3.selectAll('.axis_x g .tick[id="' + i + '"] rect')
          .attr('fill', '#6c88b0')

        this.selected.push(i);
      }

      let x = [0,0];

      let bg = Number(d3.select(".chart_bars_bg rect").attr('width'));
      let width = Number(d3.select(".chart_bars rect").attr('width'));
      let padding = bg - width;

      x[0] = Number(d3.selectAll('.chart_bars rect[id="' + this.selected[0] + '"').attr("x"))-padding/2
      x[1] = Number(d3.selectAll('.chart_bars rect[id="' + this.selected[this.selected.length-1] + '"').attr("x"))+width+padding/2

      d3.select('.chart_content')
        .append("line")
        .attr("class", "hover_line")
        .attr("x1", x[0])
        .attr("x2", x[0])
        .attr("y1", -20)
        .attr("y2", this.height+35)
        .attr("stroke", "#72a2d8")
        .attr("stroke-width", 1.5)

      d3.select('.chart_content')
        .append("circle")
        .attr("class", "hover_line")
        .attr("cx", x[0])
        .attr("cy", this.height+35)
        .attr("r", 4)
        .attr("fill", "#72a2d8")

      d3.select('.chart_content')
        .append("circle")
        .attr("class", "hover_line")
        .attr("cx", x[0])
        .attr("cy", -20)
        .attr("r", 4)
        .attr("fill", "#72a2d8")

      d3.select('.chart_content')
        .append("line")
        .attr("class", "hover_line")
        .attr("x1", x[1])
        .attr("x2", x[1])
        .attr("y1", -20)
        .attr("y2", this.height+35)
        .attr("stroke", "#72a2d8")
        .attr("stroke-width", 1.5)

      d3.select('.chart_content')
        .append("circle")
        .attr("class", "hover_line")
        .attr("cx", x[1])
        .attr("cy", this.height+35)
        .attr("r", 4)
        .attr("fill", "#72a2d8")

      d3.select('.chart_content')
        .append("circle")
        .attr("class", "hover_line")
        .attr("cx", x[1])
        .attr("cy", -20)
        .attr("r", 4)
        .attr("fill", "#72a2d8")

    }
    else {
      d3.select('.hover_line').remove()

      d3.selectAll('.chart_bars .chart_bar')
        .attr('fill', '#646883')

      d3.selectAll('.chart_bar_points rect')
        .attr('fill', '#757b96')

      d3.selectAll('.axis_x g .tick text')
        .attr('fill', '#9393a8')

      d3.selectAll('.axis_x g .tick rect')
        .attr('fill', 'none')
    }
  }

  ngOnDestroy() {
    this.scrollSubscription.unsubscribe();
  }

}

interface ChartData{
  plan: number,
  fact: number[],
  date: string
}
