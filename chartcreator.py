import os
import matplotlib.pyplot as plt
import numpy as np
import json


__location__ = os.path.realpath(
    os.path.join(os.getcwd(), os.path.dirname(__file__)))


#Simple chart, once working I'll iterate to get the candles.
def makeChart(data):
    time_stamps = []
    transactions = []

    for key in data:       
        time_stamps.append(key["timestamp"])
        transactions.append(key["price"])


    plt.plot(time_stamps, transactions)
    plt.savefig("testingChart.png")

with open(os.path.join(__location__,'output.json'), 'r') as f:
    config = json.load(f)
    makeChart(config)