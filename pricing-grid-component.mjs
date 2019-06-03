import {PolymerElement, html} from "https://unpkg.com/@polymer/polymer@next/polymer-element.js?module"

class PricingGridComponent extends PolymerElement {
  static get properties() {
    return {
      displayCount: {type: Number, value: 2, reflectToAttribute: true, notify: true},
      period: {type: String, value: "monthly", reflectToAttribute: true, notify: true},
      currency: {type: String, value: "USD", reflectToAttribute: true, notify: true},
      isStarter: {type: Boolean, computed: "isTierSelected(displayCount, period,  pricingData, 0)"},
      isBasic: {type: Boolean, computed: "isTierSelected(displayCount, period, pricingData, 1)"},
      isAdvanced: {type: Boolean, computed: "isTierSelected(displayCount, period, pricingData, 2)"},
      isEnterprise: {type: Boolean, computed: "isTierSelected(displayCount, period, pricingData, 3)"},
      pricingData: {type: Object, value: {}}
    };
  }
  
  getTiers(pricingData, period = "monthly") {
  
    if (Object.keys(pricingData).length === 0) {return undefined;}
    
    const periodUnit = period.endsWith("ly") ? this.period.slice(0,-2) : "";

    if (periodUnit === "") {return undefined;}

    const planObj = pricingData.filter(plan=>{
      return plan.period === 1 && plan.period_unit === periodUnit && plan.currency_code === this.currency;
    })[0];
    
    if (!planObj) {return undefined;}
    
    const tiers = planObj.tiers;
    
    if (!tiers) {return undefined;}
    
    tiers.sort(function(a, b){return a.starting_unit - b.starting_unit});
    
    return tiers;
    
  }
  
  getPrice(pricingData, period, tierIndex) {
  
    const tiers = this.getTiers(pricingData, period);
  
    if (!tiers) {return undefined;}
    
    const pricePennies = tiers[tierIndex].price;

    const monthlyPricePennies = period === "yearly" ? pricePennies / 12 : pricePennies;
    
    return (monthlyPricePennies / 100).toFixed(2);
    
  }
  
  getLowerLimit(pricingData, period, tierIndex) {
  
    const tiers = this.getTiers(pricingData, period);
  
    if (!tiers) {return undefined;}
    
    return tiers[tierIndex].starting_unit;
    
  }
  
  getUpperLimit(pricingData, period, tierIndex) {
  
    const tiers = this.getTiers(pricingData);
  
    if (!tiers) {return undefined;}
    
    return tiers[tierIndex].ending_unit;
    
  }
  
  isTierSelected(displayCount, period,  pricingData, tierIndex){
  
    const lowerLimit = this.getLowerLimit(pricingData, period, tierIndex);
    const upperLimit = this.getUpperLimit(pricingData, period, tierIndex);
    
    return lowerLimit <= displayCount && (!upperLimit || displayCount <= upperLimit);
  }
  
  static get template() {
    return html`
      <style>
        #main {
          width: 100%;
          text-align: center;
        }
        .gridRectangle {
          width: 100%;
          height: 327px;
          border-radius: 5px;
          border: solid 1px #979797;
        }
        .gridRow {
          width: 100%;
          height: 82px;
          box-shadow: inset 0 -1px 0 0 #979797;
        }
        .gridRow[selected] {
          background-color: #e8e8e8;
          box-shadow:inset 0px 0px 0px 2px #000000;
        }
        .tierName {
          float:left;
          margin-left:1em;
          font-family: ProximaNova;
          font-size: 24px;
          font-weight: bold;
          font-style: normal;
          font-stretch: normal;
          line-height: 82px;
          letter-spacing: normal;
          color: #979797;
        }
        .tierDisplays {
          float:left;
          margin-left:1em;
          font-family: ProximaNova;
          font-size: 16px;
          font-weight: 500;
          font-style: normal;
          font-stretch: normal;
          line-height: 82px;
          letter-spacing: normal;
          color: #979797;
        }
        .tierPrice {
          float:right;
          margin-right:1em;
          font-family: ProximaNova;
          font-size: 24px;
          font-weight: bold;
          font-style: normal;
          font-stretch: normal;
          line-height: 82px;
          letter-spacing: normal;
          text-align: right;
          color: #979797;
        }
      </style>
      <div id="main">

          <div id="gridContainer" class="gridRectangle">
            <div id="tierStarter" class="gridRow" selected$=[[isStarter]]><span class="tierName">Starter</span><span class="tierDisplays">[[getLowerLimit(pricingData, period, 0)]]-[[getUpperLimit(pricingData, period, 0)]] Displays</span> <span class="tierPrice">$[[getPrice(pricingData, period, 0)]]</span></div>
            <div id="tierBasic" class="gridRow" selected$=[[isBasic]]><span class="tierName">Basic</span><span class="tierDisplays">[[getLowerLimit(pricingData, period, 1)]]-[[getUpperLimit(pricingData, period, 1)]] Displays</span> <span class="tierPrice">$[[getPrice(pricingData, period, 1)]]</span></div>
            <div id="tierAdvanced" class="gridRow" selected$=[[isAdvanced]]><span class="tierName">Advanced</span><span class="tierDisplays">[[getLowerLimit(pricingData, period, 2)]]-[[getUpperLimit(pricingData, period, 2)]] Displays</span> <span class="tierPrice">$[[getPrice(pricingData, period, 2)]]</span></div>
            <div id="tierEnterprise" class="gridRow" selected$=[[isEnterprise]]><span class="tierName">Enterprise</span><span class="tierDisplays">[[getLowerLimit(pricingData, period, 3)]] or more Displays</span> <span class="tierPrice">$[[getPrice(pricingData, period, 3)]]</span></div>
          </div>
      </div>
    `;
  }
}

window.customElements.define("pricing-grid-component", PricingGridComponent);