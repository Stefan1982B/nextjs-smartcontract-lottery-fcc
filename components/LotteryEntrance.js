import { useWeb3Contract } from "react-moralis"
import { abi, contractAddresses } from "../constants"
import { useMoralis } from "react-moralis"
import { useEffect, useState } from "react"
import { ethers } from "ethers"
import { useNotification } from "web3uikit"

export default function LotteryEntrance() {
    const { chainId: chainIdHex, isWeb3Enabled } = useMoralis()
    const chainId = parseInt(chainIdHex)
    const raffleAddress = chainId in contractAddresses ? contractAddresses[chainId][0] : null
    const dispatch = useNotification()
    const [entranceFeeFromContract, setEntranceFeeFromContract] = useState("0")
    const [numPlayersFromContract, setNumPlayersFromContract] = useState("0")
    const [recentWinnerFromContract, setRecentWinnerFromContract] = useState("")

    const { runContractFunction: enterRaffle } = useWeb3Contract({
        abi: abi,
        contractAddress: raffleAddress,
        functionName: "enterRaffle",
        params: {},
        msgValue: entranceFeeFromContract,
    })

    const { runContractFunction: getEntranceFee } = useWeb3Contract({
        abi: abi,
        contractAddress: raffleAddress,
        functionName: "getEntranceFee",
        params: {},
    })

    const { runContractFunction: getNumberOfPlayers } = useWeb3Contract({
        abi: abi,
        contractAddress: raffleAddress,
        functionName: "getNumberOfPlayers",
        params: {},
    })

    const { runContractFunction: getRecentWinner } = useWeb3Contract({
        abi: abi,
        contractAddress: raffleAddress,
        functionName: "getRecentWinner",
        params: {},
    })

    async function updateUI() {
        const entranceFeeFromCall = (await getEntranceFee()).toString()
        const numPlayersFromCall = (await getNumberOfPlayers()).toString()
        const recentWinnerFromCall = await getRecentWinner()
        setEntranceFeeFromContract(entranceFeeFromCall)
        setNumPlayersFromContract(numPlayersFromCall)
        setRecentWinnerFromContract(recentWinnerFromCall)
    }

    useEffect(() => {
        if (isWeb3Enabled) {
            updateUI()
        }
    }, [isWeb3Enabled])

    const handleSuccess = async function (tx) {
        await tx.wait(1)
        handleNewNotification(tx)
        updateUI()
    }

    const handleNewNotification = function () {
        dispatch({
            type: "info",
            message: "transaction complete!",
            title: "tx notification",
            position: "topR",
            icon: "bell",
        })
    }

    return (
        <div>
            Hi from lottery Entrance!
            {raffleAddress ? (
                <div>
                    <button
                        onClick={async function () {
                            await enterRaffle({
                                onSuccess: handleSuccess,
                                onError: (error) => console.log(error),
                            })
                        }}
                    >
                        Enter raffle
                    </button>
                    <div>
                        {" "}
                        Entrance Fee: {ethers.utils.formatUnits(
                            entranceFeeFromContract,
                            "ether"
                        )}{" "}
                        ETH{" "}
                    </div>
                    <div> Number of players: {numPlayersFromContract} </div>
                    <div> Recent winner : {recentWinnerFromContract} </div>
                </div>
            ) : (
                <div>No raffle address detected</div>
            )}
        </div>
    )
}
