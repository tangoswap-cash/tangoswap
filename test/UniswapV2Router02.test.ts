import { expect } from "chai";
import { prepare, deploy, getBigNumber, createSLP } from "./utilities"
const { ethers: { constants: { MaxUint256 }}} = require("ethers")

describe("UniswapV2Router02", function () {
  before(async function () {
    await prepare(this, ["UniswapV2Router02", "ERC20Mock", "UniswapV2Factory", "UniswapV2Pair"])
  })

  beforeEach(async function () {
    await deploy(this, [
      ["sushi", this.ERC20Mock, ["SUSHI", "SUSHI", getBigNumber("10000000")]],
      ["dai", this.ERC20Mock, ["DAI", "DAI", getBigNumber("10000000")]],
      ["mic", this.ERC20Mock, ["MIC", "MIC", getBigNumber("10000000")]],
      ["usdc", this.ERC20Mock, ["USDC", "USDC", getBigNumber("10000000")]],
      ["weth", this.ERC20Mock, ["WETH", "ETH", getBigNumber("10000000")]],
      ["strudel", this.ERC20Mock, ["$TRDL", "$TRDL", getBigNumber("10000000")]],
      ["factory", this.UniswapV2Factory, [this.alice.address]],
    ])

    await deploy(this, [["router", this.UniswapV2Router02, [this.factory.address, this.weth.address]]])
    // await deploy(this, [["bar", this.SushiBar, [this.sushi.address]]])
    // await deploy(this, [["sushiMaker", this.SushiMaker, [this.factory.address, this.bar.address, this.sushi.address, this.weth.address]]])
    // await deploy(this, [["exploiter", this.SushiMakerExploitMock, [this.sushiMaker.address]]])
    await createSLP(this, "sushiEth", this.sushi, this.weth, getBigNumber(10))
    await createSLP(this, "strudelEth", this.strudel, this.weth, getBigNumber(10))
    await createSLP(this, "daiEth", this.dai, this.weth, getBigNumber(10))
    await createSLP(this, "usdcEth", this.usdc, this.weth, getBigNumber(10))
    await createSLP(this, "micUSDC", this.mic, this.usdc, getBigNumber(10))
    await createSLP(this, "sushiUSDC", this.sushi, this.usdc, getBigNumber(10))
    await createSLP(this, "daiUSDC", this.dai, this.usdc, getBigNumber(10))
    await createSLP(this, "daiMIC", this.dai, this.mic, getBigNumber(10))
  })
  describe("addLiquidityETH", function () {
    it("tests addLiquidityETH", async function () {
      const overrides = {
        gasLimit: 9500000
      }

      const sushiAmount = "1";
      const WETHAmount = "1";

      console.log("test addLiquidityETH this.router.address:   ", this.router.address);
      console.log("test addLiquidityETH this.sushi.address:    ", this.sushi.address);
      console.log("test addLiquidityETH this.weth.address:     ", this.weth.address);
      console.log("test addLiquidityETH this.sushiEth.address: ", this.sushiEth.address);
      console.log("test addLiquidityETH this.alice.address:    ", this.alice.address);
      console.log("test addLiquidityETH this.factory.address:  ", this.factory.address);

      console.log("test addLiquidityETH 1");
      await this.sushi.approve(this.router.address, sushiAmount);
      console.log("test addLiquidityETH 2");

      await this.router.addLiquidityETH(this.sushi.address, sushiAmount, sushiAmount, WETHAmount, this.alice.address, MaxUint256, {
        ...overrides,
        value: WETHAmount
      })

      console.log("test addLiquidityETH 3");
    })
  })
})
