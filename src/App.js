import React, { useEffect, useState, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { connect } from "./redux/blockchain/blockchainActions";
import { fetchData } from "./redux/data/dataActions";
import * as s from "./styles/globalStyles";
import styled from "styled-components";

const truncate = (input, len) =>
  input.length > len ? `${input.substring(0, len)}...` : input;

export const StyledButton = styled.button`
  padding: 10px;
  border-radius: 50px;
  border: none;
  background-color: var(--secondary);
  padding: 10px;
  font-weight: bold;
  color: var(--secondary-text);
  width: 300px;
  cursor: pointer;
  box-shadow: 0px 6px 0px -2px rgba(250, 250, 250, 0.3);
  -webkit-box-shadow: 0px 6px 0px -2px rgba(250, 250, 250, 0.3);
  -moz-box-shadow: 0px 6px 0px -2px rgba(250, 250, 250, 0.3);
  :active {
    box-shadow: none;
    -webkit-box-shadow: none;
    -moz-box-shadow: none;
  }
`;

export const StyledRoundButton = styled.button`
  padding: 10px;
  border-radius: 100%;
  border: none;
  background-color: var(--secondary);
  padding: 10px;
  font-weight: bold;
  font-size: 15px;
  color: var(--secondary-text);
  width: 30px;
  height: 30px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0px 4px 0px -2px rgba(250, 250, 250, 0.3);
  -webkit-box-shadow: 0px 4px 0px -2px rgba(250, 250, 250, 0.3);
  -moz-box-shadow: 0px 4px 0px -2px rgba(250, 250, 250, 0.3);
  :active {
    box-shadow: none;
    -webkit-box-shadow: none;
    -moz-box-shadow: none;
  }
`;

export const ResponsiveWrapper = styled.div`
  display: flex;
  flex: 1;
  flex-direction: column;
  justify-content: stretched;
  align-items: stretched;
  width: 100%;
  @media (min-width: 767px) {
    flex-direction: row;
  }
`;

export const StyledLogo = styled.img`
  width: 200px;
  @media (min-width: 767px) {
    width: 200px;
  }
  transition: width 0.5s;
  transition: height 0.5s;
`;

export const StyledLogo2 = styled.img`
  width: 200px;
  @media (min-width: 767px) {
    width: 50px;
  }
  transition: width 0.5s;
  transition: height 0.5s;
`;


export const StyledImg = styled.img`
  box-shadow: 0px 5px 11px 2px rgba(0, 0, 0, 0.7);
  border: 4px dashed var(--secondary);
  background-color: var(--accent);
  border-radius: 100%;
  width: 200px;
  @media (min-width: 900px) {
    width: 250px;
  }
  @media (min-width: 1000px) {
    width: 300px;
  }
  transition: width 0.5s;
`;

export const StyledLink = styled.a`
  color: var(--secondary);
  text-decoration: none;
`;

function App() {
  const dispatch = useDispatch();
  const [timeRemaining, setTimeRemaining] = useState(null);
  const blockchain = useSelector((state) => state.blockchain);
  const data = useSelector((state) => state.data);
  const [claimingNft, setClaimingNft] = useState(false);
  const [feedback, setFeedback] = useState(`Click to mint your COOL.`);
  const [mintAmount, setMintAmount] = useState(1);
  const [CONFIG, SET_CONFIG] = useState({
    CONTRACT_ADDRESS: "",
    SCAN_LINK: "",
    NETWORK: {
      NAME: "",
      SYMBOL: "",
      ID: 0,
    },
    NFT_NAME: "",
    SYMBOL: "",
    MAX_SUPPLY: 1,
    WEI_COST: 0,
    DISPLAY_COST: 0,
    GAS_LIMIT: 0,
    MARKETPLACE: "",
    MARKETPLACE_LINK: "",
    SHOW_BACKGROUND: false,
  });

  const claimNFTs = () => {
    let cost = CONFIG.WEI_COST;
    let gasLimit = CONFIG.GAS_LIMIT;
    let totalCostWei = String(cost * mintAmount);
    let totalGasLimit = String(120000);
    console.log("Cost: ", totalCostWei);
    console.log("Gas limit: ", totalGasLimit);
    setFeedback(`Minting your ${CONFIG.NFT_NAME}...`);
    setClaimingNft(true);
    blockchain.smartContract.methods
      .mint(mintAmount)
      .send({
        gasLimit: String(totalGasLimit),
        to: CONFIG.CONTRACT_ADDRESS,
        from: blockchain.account,
        value: totalCostWei,
      })
      .once("error", (err) => {
        console.log(err);
        setFeedback("Sorry, something went wrong please try again later.");
        setClaimingNft(false);
      })
      .then((receipt) => {
        console.log(receipt);
        setFeedback(
          `WOW, the ${CONFIG.NFT_NAME} is yours! go visit Opensea.io to view it.`
        );
        setClaimingNft(false);
        dispatch(fetchData(blockchain.account));
      });
  };

  const decrementMintAmount = () => {
    let newMintAmount = mintAmount - 1;
    if (newMintAmount < 1) {
      newMintAmount = 1;
    }
    setMintAmount(newMintAmount);
  };

  const incrementMintAmount = () => {
    let newMintAmount = mintAmount + 1;
    if (newMintAmount > 10) {
      newMintAmount = 10;
    }
    setMintAmount(newMintAmount);
  };

  const getData = () => {
    if (blockchain.account !== "" && blockchain.smartContract !== null) {
      dispatch(fetchData(blockchain.account));
    }
  };

  const getConfig = async () => {
    const configResponse = await fetch("/config/config.json", {
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
    });
    const config = await configResponse.json();
    SET_CONFIG(config);
  };

  useEffect(() => {
    getConfig();
  }, []);

  useEffect(() => {
    getData();
  }, [blockchain.account]);

  useEffect(() => {
    // Calculate the time remaining in the timer
    const endTime = new Date("2023-01-22T10:00:00Z");
    const timeRemaining = endTime - new Date();

    // Set the initial time remaining
    setTimeRemaining(timeRemaining);

    // Update the time remaining every second
    const interval = setInterval(() => {
      setTimeRemaining(timeRemaining - 1000);
    }, 1000);

    // Clean up the interval when the component unmounts
    return () => clearInterval(interval);
  }, []);


  return (
    <s.Screen>
      {/* <s.Container
        flex={1}
        ai={"center"}
        style={{ padding: 24, backgroundColor: "var(--primary)" }}
      //image={CONFIG.SHOW_BACKGROUND ? "/config/images/bg.png" : null}
      > */}


      <s.Container
        flex={1}
        ai={"center"}
        style={{ padding: 24, backgroundColor: "var(--primary)" }}
        image={CONFIG.SHOW_BACKGROUND ? "/config/images/bg.png" : null}
      >






        <s.SpacerSmall />
        <ResponsiveWrapper flex={1} style={{ padding: 24 }} test>
          <s.SpacerLarge />
          <s.Container
            flex={2}
            jc={"center"}
            ai={"center"}
            style={{
              //backgroundColor: "var(--accent)",
              padding: 24, //24
              borderRadius: 30, //24
              //border: "4px dashed var(--primary)",
              //boxShadow: "0px 5px 11px 2px rgba(0,0,0,0.7)",
              opacity: 1
            }}
          //image={CONFIG.SHOW_BACKGROUND ? "/config/images/bg.png" : null}
          >

            {/* <a href={CONFIG.MARKETPLACE_LINK}>
              <StyledLogo2 alt={"logo"} src={"/config/images/opensea.png"} />
            </a>




            <s.TextDescription
              style={{
                textAlign: "center",
                fontSize: 50,
                fontWeight: "bold",
                color: "var(--accent-text)",
              }}
            >
              Sigma Labs by Bani
            </s.TextDescription>
            <s.SpacerLarge />

            {/* <s.TextDescription
              style={{
                textAlign: "center",
                fontSize: 20,
                //fontWeight: "bold",
                color: "var(--accent-text)",
              }}
            >
              Golden Eden by Zeph is a mesmerizing digital world that blends art, technology, and storytelling to create an unforgettable NFT experience. Explore the beauty and mystery of this unique digital landscape and discover the secrets hidden within.
            </s.TextDescription> */}
            <s.SpacerLarge />

            <s.SpacerLarge />
            <s.SpacerLarge />
            <s.SpacerLarge />
            <s.SpacerLarge />
            <s.SpacerLarge />
            <s.SpacerLarge />
            <s.SpacerLarge />


            {/* 
            <s.TextDescription
              style={{
                textAlign: "center",
                fontSize: 30,
                fontWeight: "bold",
                color: "var(--accent-text)",
              }}
            >
              MINT DETAILS
            </s.TextDescription> */}



            {/* 
            <s.TextDescription
              style={{
                textAlign: "center",
                fontSize: 60,
                fontWeight: "bold",
                color: "var(--accent-text)",
              }}
            >
              Ordiwalls
            </s.TextDescription> */}





            {/* 

            <s.TextDescription
              style={{
                textAlign: "center",
                fontSize: 60,
                fontWeight: "bold",
                color: "var(--accent-text)",
              }}
            >
              Time until mint:
            </s.TextDescription> */}


            <s.TextDescription
              style={{
                textAlign: "center",
                fontSize: 60,
                fontWeight: "bold",
                color: "var(--accent-text)",
              }}
            >
              MINT OPEN
            </s.TextDescription>


            {/* <s.TextDescription
              style={{
                textAlign: "center",
                fontSize: 60,
                fontWeight: "bold",
                color: "var(--accent-text)",
              }}
            >
              SUPPLY:
            </s.TextDescription> */}

            <s.TextTitle
              style={{
                textAlign: "center",
                fontSize: 60,
                fontWeight: "bold",
                color: "var(--accent-text)",
              }}
            >
              {data.totalSupply} / {CONFIG.MAX_SUPPLY}
            </s.TextTitle>

            <span
              style={{
                textAlign: "center",
              }}
            >

            </span>
            <s.SpacerSmall />
            {Number(data.totalSupply) >= CONFIG.MAX_SUPPLY ? (
              <>
                <s.TextTitle
                  style={{ textAlign: "center", color: "var(--accent-text)" }}
                >
                  The sale has ended.
                </s.TextTitle>
                <s.TextDescription
                  style={{ textAlign: "center", color: "var(--accent-text)" }}
                >
                  You can still find {CONFIG.NFT_NAME} on
                </s.TextDescription>
                <s.SpacerSmall />
                <StyledLink target={"_blank"} href={CONFIG.MARKETPLACE_LINK}>
                  {CONFIG.MARKETPLACE}
                </StyledLink>
              </>
            ) : (
              <>
                {/* <s.TextTitle
                  style={{ textAlign: "center", color: "var(--accent-text)" }}
                >
                  {CONFIG.SYMBOL} mint price: {CONFIG.DISPLAY_COST}{" "}
                  {CONFIG.NETWORK.SYMBOL}.
                </s.TextTitle> */}
                <s.TextTitle
                  style={{ textAlign: "center", color: "var(--accent-text)", fontSize: 35, fontWeight: "bold" }}
                >
                  {CONFIG.SYMBOL} mint price: {CONFIG.DISPLAY_COST}{" "}
                  {CONFIG.NETWORK.SYMBOL}.
                </s.TextTitle>
                <s.SpacerXSmall />

                <s.SpacerSmall />
                {blockchain.account === "" ||
                  blockchain.smartContract === null ? (
                  <s.Container ai={"center"} jc={"center"}>
                    <s.SpacerSmall />
                    <StyledButton
                      onClick={(e) => {
                        e.preventDefault();
                        dispatch(connect());
                        getData();
                      }}
                    >
                      MINT
                    </StyledButton>

                    {blockchain.errorMsg !== "" ? (
                      <>
                        <s.SpacerSmall />
                        <s.TextDescription
                          style={{
                            textAlign: "center",
                            color: "var(--accent-text)",
                          }}
                        >
                          {blockchain.errorMsg}
                        </s.TextDescription>
                      </>
                    ) : null}
                    <s.SpacerLarge />




                    <s.TextDescription
                      style={{
                        textAlign: "center",
                        color: "var(--primary-text)",
                        fontSize: 30,
                        fontWeight: "bold"
                      }}
                    >
                      <StyledLink target={"_blank"} href={CONFIG.SCAN_LINK}>
                        {truncate(CONFIG.CONTRACT_ADDRESS, 50)}
                      </StyledLink>
                    </s.TextDescription>





                  </s.Container>
                ) : (
                  <>

                    <s.TextDescription
                      style={{
                        textAlign: "center",
                        color: "var(--accent-text)",
                        fontSize: 20,
                      }}
                    >
                      ERC-721A contract optimized for multiple mints
                    </s.TextDescription>
                    <s.TextDescription
                      style={{
                        textAlign: "center",
                        color: "var(--accent-text)",
                        fontSize: 20,
                      }}
                    >
                      Choose Mint Amount:
                    </s.TextDescription>
                    <s.SpacerMedium />
                    <s.Container ai={"center"} jc={"center"} fd={"row"}>
                      <StyledRoundButton
                        style={{ lineHeight: 0.4 }}
                        disabled={claimingNft ? 1 : 0}
                        onClick={(e) => {
                          e.preventDefault();
                          decrementMintAmount();
                        }}
                      >
                        -
                      </StyledRoundButton>
                      <s.SpacerMedium />
                      <s.TextDescription
                        style={{
                          fontSize: 30,
                          textAlign: "center",
                          color: "var(--accent-text)",
                        }}
                      >
                        {mintAmount}
                      </s.TextDescription>
                      <s.SpacerMedium />
                      <StyledRoundButton
                        disabled={claimingNft ? 1 : 0}
                        onClick={(e) => {
                          e.preventDefault();
                          incrementMintAmount();
                        }}
                      >
                        +
                      </StyledRoundButton>

                      <s.SpacerMedium />



                    </s.Container>
                    <s.SpacerSmall />
                    <s.SpacerSmall />
                    <s.TextDescription
                      style={{
                        fontSize: 30,
                        textAlign: "center",
                        color: "var(--accent-text)",
                      }}
                    >
                      {(mintAmount * CONFIG.DISPLAY_COST).toFixed(2)} ETH
                    </s.TextDescription>
                    <s.SpacerSmall />
                    <s.SpacerSmall />
                    <s.SpacerSmall />
                    <s.SpacerSmall />
                    <s.Container ai={"center"} jc={"center"} fd={"row"}>
                      <StyledButton
                        disabled={claimingNft ? 1 : 0}
                        onClick={(e) => {
                          e.preventDefault();
                          claimNFTs();
                          getData();
                        }}
                      >
                        {claimingNft ? "BUSY" : "MINT"}
                      </StyledButton>



                    </s.Container>

                    <StyledButton
                      style={{
                        margin: "5px",
                      }}
                      onClick={(e) => {
                        window.open(CONFIG.MARKETPLACE_LINK, "_blank");
                      }}
                    >
                      {CONFIG.MARKETPLACE}
                    </StyledButton>
                  </>
                )}
              </>
            )}
            <s.SpacerMedium />
            <s.TextDescription
              style={{
                textAlign: "center",
                color: "var(--accent-text)",
                fontSize: 40,
              }}
            >
              ABOUT
            </s.TextDescription>
            <s.SpacerMedium />

            <s.TextDescription
              style={{
                textAlign: "center",
                color: "var(--accent-text)",
                fontSize: 25,
              }}
            >
              Ordiglass is a cutting-edge project that introduces a fresh perspective to the digital art scene.
            </s.TextDescription>
            <s.TextDescription
              style={{
                textAlign: "center",
                color: "var(--accent-text)",
                fontSize: 25,
              }}
            >
              By possessing and burning a designated token on the Ethereum blockchain, you'll gain access to the Ordiglass collection on the BITCOIN blockchain.

            </s.TextDescription>
            <s.TextDescription
              style={{
                textAlign: "center",
                color: "var(--accent-text)",
                fontSize: 25,
              }}
            >

              With the Ordiglass protocol, you'll receive not only an Ordiglass NFT on the Ethereum blockchain,
            </s.TextDescription>
            <s.TextDescription
              style={{
                textAlign: "center",
                color: "var(--accent-text)",
                fontSize: 25,
              }}
            >

              but also its corresponding NFT on the Bitcoin blockchain by interacting with your ETH token.
            </s.TextDescription>
            <s.SpacerMedium />

            <s.SpacerMedium />

            <s.TextDescription
              style={{
                textAlign: "center",
                color: "var(--accent-text)",
                fontSize: 25,
              }}
            > Ordiglass offers a unique method of creating digital art, with each piece being a one-of-a-kind treasure.

            </s.TextDescription>
            <s.TextDescription
              style={{
                textAlign: "center",
                color: "var(--accent-text)",
                fontSize: 25,
              }}
            > An enchanting color scheme is applied to the glass surfaces, resulting in a breathtaking work of art.


            </s.TextDescription>
            <s.TextDescription
              style={{
                textAlign: "center",
                color: "var(--accent-text)",
                fontSize: 25,
              }}
            >
              The rarity of each Ordiglass is established by the actions of its holders on the blockchain, so be sure to follow the instructions carefully.

            </s.TextDescription>
            <s.SpacerMedium />
            <s.SpacerMedium />
            <s.SpacerMedium />
            <s.SpacerMedium />
            <s.SpacerMedium />
            <s.TextDescription
              style={{
                textAlign: "center",
                color: "var(--accent-text)",
                fontSize: 40,
              }}
            >
              TEAM
            </s.TextDescription>
            <s.TextDescription
              style={{
                textAlign: "center",
                color: "var(--accent-text)",
                fontSize: 25,
              }}
            > Zephyrine Finlay - Lead Designer

            </s.TextDescription>

            <s.TextDescription
              style={{
                textAlign: "center",
                color: "var(--accent-text)",
                fontSize: 25,
              }}
            > Zephyrine is a talented artist and designer who has a passion for bringing creativity to the digital world.

            </s.TextDescription>
            <s.TextDescription
              style={{
                textAlign: "center",
                color: "var(--accent-text)",
                fontSize: 25,
              }}
            > She has years of experience in graphic design and has worked on various projects in the art and tech industries.


            </s.TextDescription>
            <s.TextDescription
              style={{
                textAlign: "center",
                color: "var(--accent-text)",
                fontSize: 25,
              }}
            >
              At Ordiglass, she leads the design team and is responsible for creating visually appealing NFTs that capture the essence of the project.

            </s.TextDescription>
            <s.SpacerMedium />
            <s.SpacerMedium />
            <s.TextDescription
              style={{
                textAlign: "center",
                color: "var(--accent-text)",
                fontSize: 25,
              }}
            > Neo Atlas - Blockchain Engineer

            </s.TextDescription>

            <s.TextDescription
              style={{
                textAlign: "center",
                color: "var(--accent-text)",
                fontSize: 25,
              }}
            > Neo is a seasoned engineer with expertise in blockchain technology.

            </s.TextDescription>
            <s.TextDescription
              style={{
                textAlign: "center",
                color: "var(--accent-text)",
                fontSize: 25,
              }}
            > With a background in software development, Neo has the skills and expertise to bring the Ordiglass vision to life.

            </s.TextDescription>
            <s.TextDescription
              style={{
                textAlign: "center",
                color: "var(--accent-text)",
                fontSize: 25,
              }}
            >
              At Ordiglass, he is responsible for building the infrastructure and implementing the technology that powers the platform.

            </s.TextDescription>
            <s.SpacerMedium />
            <s.SpacerMedium />
            <s.TextDescription
              style={{
                textAlign: "center",
                color: "var(--accent-text)",
                fontSize: 25,
              }}
            > Thalia Grace - Marketing Manager

            </s.TextDescription>

            <s.TextDescription
              style={{
                textAlign: "center",
                color: "var(--accent-text)",
                fontSize: 25,
              }}
            > Thalia is a seasoned marketer with a passion for spreading the word about innovative projects.

            </s.TextDescription>
            <s.TextDescription
              style={{
                textAlign: "center",
                color: "var(--accent-text)",
                fontSize: 25,
              }}
            > With a deep understanding of marketing and digital art space, Thalia has the knowledge and skills to create awareness about Ordiglass.


            </s.TextDescription>
            <s.TextDescription
              style={{
                textAlign: "center",
                color: "var(--accent-text)",
                fontSize: 25,
              }}
            >
              At Ordiglass, she is responsible for managing the marketing and branding efforts and is tasked with creating awareness about the project.

            </s.TextDescription>
            <s.SpacerMedium />
            <s.SpacerMedium />
            <s.TextDescription
              style={{
                textAlign: "center",
                color: "var(--accent-text)",
                fontSize: 25,
              }}
            > Ellis Chan - Lead Developer

            </s.TextDescription>

            <s.TextDescription
              style={{
                textAlign: "center",
                color: "var(--accent-text)",
                fontSize: 25,
              }}
            > Ellis is a skilled software developer with a passion for creating innovative digital experiences.

            </s.TextDescription>
            <s.TextDescription
              style={{
                textAlign: "center",
                color: "var(--accent-text)",
                fontSize: 25,
              }}
            > He has a strong background in programming and has been team leader for several projects in the industry.


            </s.TextDescription>
            <s.TextDescription
              style={{
                textAlign: "center",
                color: "var(--accent-text)",
                fontSize: 25,
              }}
            >
              At Ordiglass, he leads the development team and is responsible for building the platform and ensuring its smooth operation.

            </s.TextDescription>
            <s.SpacerMedium />
            <s.SpacerMedium />
            <s.TextDescription
              style={{
                textAlign: "center",
                color: "var(--accent-text)",
                fontSize: 25,
              }}
            > Freya Novak - User Experience (UX) Specialist

            </s.TextDescription>

            <s.TextDescription
              style={{
                textAlign: "center",
                color: "var(--accent-text)",
                fontSize: 25,
              }}
            > Freya is an expert in user experience design and has a passion for creating intuitive and user-friendly digital experiences.

            </s.TextDescription>
            <s.TextDescription
              style={{
                textAlign: "center",
                color: "var(--accent-text)",
                fontSize: 25,
              }}
            > She has worked on multiple projects in the past and has a strong background in human-computer interaction.


            </s.TextDescription>
            <s.TextDescription
              style={{
                textAlign: "center",
                color: "var(--accent-text)",
                fontSize: 25,
              }}
            >
              At Ordiglass, she is responsible for optimizing the user experience and ensuring that the platform is easy to use for all users.

            </s.TextDescription>
            <s.SpacerMedium />
            <s.SpacerMedium />

          </s.Container>

          <s.SpacerLarge />
        </ResponsiveWrapper>
        <s.SpacerMedium />
        <s.Container jc={"center"} ai={"center"} style={{ width: "70%" }}>

          <s.SpacerSmall />

        </s.Container>



        <s.SpacerLarge />
        <s.SpacerLarge />










      </s.Container >





    </s.Screen >
  );
}

export default App;
