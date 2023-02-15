App = {
  web3Provider: null,
  contracts: {},
  account: "0taskData0",

  init: async function () {
    return await App.initWeb3();
  },

  initWeb3: async function () {
    // TODO: refactor conditional
    if (typeof web3 !== "undefined") {
      // If a web3 instance is already provided by Meta Mask.
      App.web3Provider = web3.currentProvider;
      web3 = new Web3(web3.currentProvider);
    } else {
      // Specify default instance if no web3 instance provided
      App.web3Provider = new Web3.providers.HttpProvider(
        "http://localhost:8545"
      );
      web3 = new Web3(App.web3Provider);
    }
    return App.initContract();
  },

  initContract: function () {
    $.getJSON("ToDo.json", function (toDo) {
      // Instantiate a new truffle contract from the artifact
      App.contracts.ToDo = TruffleContract(toDo);
      // Connect provider to interact with contract
      App.contracts.ToDo.setProvider(App.web3Provider);

      return App.render();
    });
  },
  render: async function () {
    // Load account data
    web3.eth.getCoinbase(function (err, account) {
      if (err === null) {
        App.account = account;
        $("#accountAddress").html("Your Account: " + account);
      }
    });

    // Create new task
    $("#taskForm").on("submit", (event) => {
      event.preventDefault();
      const content = $("#content");
      const author = $("#author");
      App.contracts.ToDo.deployed()
        .then((todo) =>
          todo.createTask(content.val(), author.val(), {
            from: App.account,
            gas: 1000000,
          })
        )
        .then((data) => {
          content.val("");
          author.val("");
          console.log("task created succesfully", data);
          window.location.href = "/";
        })
        .catch((err) => console.log("Oops... there was an error ==>> ", err));
    });

    // Done toggle handler
    $("#tableBody").on("click", (e) => {
      if ($(e.target).is("input")) {
        const [_, id] = e.target.id.split("-");
        console.log("id ==>> ", id);
        App.contracts.ToDo.deployed().then((todo) =>
          todo
            .toggleDone(id, {
              from: App.account,
              gas: 1000000,
            })
            .then((data) => {
              console.log("task is signed as done succesfully", data);
              window.location.href = "/";
            })
            .catch((err) =>
              console.log("Oops... there was an error ==>> ", err)
            )
        );
      }
    });

    // Date formater
    const getDate = async (date) =>
      new Date(await date.toNumber()).toLocaleString("eng-UK", {
        dateStyle: "full",
        timeStyle: "medium",
        hour12: true,
      });

    // Load contract data
    const getData = App.contracts.ToDo.deployed()
      .then((instance) =>
        instance.getTaskIds().then((taskIds) => {
          let promises = [];
          taskIds.forEach((taskId) => {
            promises.push(instance.getTask(taskId.toNumber()));
          });
          return promises;
        })
      )
      .catch((error) => console.error(error));
    const taskData = await getData;

    console.log("data ==>> ", taskData);
    const table = $("#tableBody");
    if (taskData.length === 0) {
      table.html("<h4>No data to display</h4>");
      return;
    }

    let x = [];
    let y = "";
    for (let i = 0; i < taskData.length; i++) {
      x = await taskData[i];
      console.log("x ==>> ", x);
      y += `<tr>
      <td>${await x[0]}</td>
      <td>${await getDate(await x[1])}</td>
      <td>${await x[2]}</td>
      <td>${await x[3]}</td>
      <td><input type="checkbox" id="checkbox-${x[0]}" ${
        x[4] ? "checked" : ""
      }/></td>
      <td>${x[5].toNumber() ? await getDate(x[5]) : "~"}</td>
      </tr>`;
    }

    // console.log("getHtml ==>> ", y);

    table.html(y);
  },
};

$(function () {
  $(window).load(function () {
    App.init();
  });
});
