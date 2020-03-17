import {PolymerElement, html} from "https://unpkg.com/@polymer/polymer@3.2.0/polymer-element.js?module"

class PricingGridComponent extends PolymerElement {
  constructor() {
    super();

    this.tierNames = [
      "Starter",
      "Basic",
      "Advanced",
      "Enterprise"
    ];
  }

  static get properties() {
    return {
      displayCount: {type: Number, value: 2, reflectToAttribute: true, notify: true},
      period: {type: String, value: "monthly", reflectToAttribute: true, notify: true},
      currency: {type: String, value: "USD", reflectToAttribute: true, notify: true},
      tierName: {type: String, computed: "getTierName(displayCount, period, pricingData)", notify: true},
      isStarter: {type: Boolean, computed: "isTierSelected(displayCount, period, pricingData, 0)"},
      isBasic: {type: Boolean, computed: "isTierSelected(displayCount, period, pricingData, 1)"},
      isAdvanced: {type: Boolean, computed: "isTierSelected(displayCount, period, pricingData, 2)"},
      isEnterprise: {type: Boolean, computed: "isTierSelected(displayCount, period, pricingData, 3)"},
      pricingData: {type: Object, value: {}}
    };
  }
  
  getTiers(pricingData, period = "monthly") {
  
    if (!pricingData || Object.keys(pricingData).length === 0) {return undefined;}
    
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

  getTierName(displayCount, period, pricingData) {
    return this.tierNames.filter((name, idx)=>{
      return this.isTierSelected(displayCount, period, pricingData, idx);
    })[0];
  }

  static get template() {
    return html`
      <style>
        #main {
          width: 100%;
          height: 100%;
          text-align: center;
        }
        .gridRectangle {
          height: 100%;
          border-radius: 4px;
          border: solid 1px #979797;
          display: flex;
          flex-direction: column;
        }
        .gridRow {
          padding: 0.7em;
          flex-grow: 1;
          display: flex;
          align-items: center;
          justify-content: space-between;
          box-shadow: inset 0 -1px 0 0 #979797;
        }
        .gridRow:last-child {
          box-shadow: none;
        }
        .gridRow[selected] {
          background-color: #e8e8e8;
          box-shadow:inset 0px 0px 0px 2px #000000;
        }
        .gridRow[selected] .tierDisplays,.gridRow[selected] .tierPrice {
          color: black;
        }

        .tierDescription {
          align-items: center;
        }
        .tierDisplays {
          font-size: 18px;
          font-weight: 500;
          font-style: normal;
          font-stretch: normal;
          letter-spacing: normal;
          color: #999999;
          margin-right: 1em;
        }
        .tierPrice {
          font-size: 18px;
          font-weight: bold;
          font-style: normal;
          font-stretch: normal;
          letter-spacing: normal;
          text-align: right;
          color: #999999;
        }
        .tierDescription {
          display: flex;
          margin: 0;
          width: 70%;
        }
        @media (max-width: 767px) {
          .gridRow {
            text-align: left;
          }
          .tierPrice {
            font-size: 1em;
          }
          .tierDisplays {
            margin: 0;
            display: block;
            font-size: 1em;
          }
          .tierDescription {
            flex-direction: column;
            align-items: flex-start;
          }
        }
      </style>
      <div id="main">
        <div id="gridContainer" class="gridRectangle">
          <div id="tierStarter" class="gridRow" selected$=[[isStarter]]>
            <div class="tierDescription">
              <span class="tierDisplays">
                [[getLowerLimit(pricingData, period, 0)]]-[[getUpperLimit(pricingData, period, 0)]] Displays
              </span>
            </div>
            <span class="tierPrice">$[[getPrice(pricingData, period, 0)]]</span>
          </div>
          <div id="tierBasic" class="gridRow" selected$=[[isBasic]]>
            <div class="tierDescription">
              <span class="tierDisplays">
                [[getLowerLimit(pricingData, period, 1)]]-[[getUpperLimit(pricingData, period, 1)]] Displays
              </span>
            </div>
            <span class="tierPrice">$[[getPrice(pricingData, period, 1)]]</span>
          </div>
          <div id="tierAdvanced" class="gridRow" selected$=[[isAdvanced]]>
            <div class="tierDescription">
              <span class="tierDisplays">
                [[getLowerLimit(pricingData, period, 2)]]-[[getUpperLimit(pricingData, period, 2)]] Displays
              </span>
            </div>
            <span class="tierPrice">$[[getPrice(pricingData, period, 2)]]</span>
          </div>
          <div id="tierEnterprise" class="gridRow" selected$=[[isEnterprise]]>
            <div class="tierDescription">
              <span class="tierDisplays">
                [[getLowerLimit(pricingData, period, 3)]] or more Displays
              </span>
            </div>
            <span class="tierPrice">$[[getPrice(pricingData, period, 3)]]</span>
          </div>
        </div>
      </div>
    `;
  }
}

window.customElements.define("pricing-grid-component", PricingGridComponent);
