// SPDX-License-Identifier: MIT
pragma solidity >=0.4.22 <0.9.0;

contract ToDo {
    struct Task {
        uint256 id;
        uint256 date;
        string content;
        string author;
        bool done;
        uint256 dateCompleted;
    }

    uint256 lastTaskID;
    uint256[] tasksIds;
    mapping(uint256 => Task) tasks;

    event TaskCreated(
        uint256 id,
        uint256 date,
        string content,
        string author,
        bool done
    );

    event TaskStatusToggled(uint256 id, bool done, uint256 date);

    constructor() public {
        lastTaskID = 0;
    }

    function createTask(string memory _content, string memory _author) public {
        lastTaskID++;
        tasks[lastTaskID] = Task(
            lastTaskID,
            block.timestamp,
            _content,
            _author,
            false,
            0
        );

        tasksIds.push(lastTaskID);
        emit TaskCreated(lastTaskID, block.timestamp, _content, _author, false);
    }

    function getTaskIds() public view returns (uint256[] memory) {
        return tasksIds;
    }

    function getTaskFixures(uint256 _id)
        public
        view
        returns (
            uint256,
            uint256,
            string memory,
            string memory,
            bool
        )
    {
        return (0, block.timestamp, "Create my first dApp", "mamat", false);
    }

    function getTask(uint256 id)
        public
        view
        tasksExists(id)
        returns (
            uint256,
            uint256,
            string memory,
            string memory,
            bool,
            uint256
        )
    {
        return (
            id,
            tasks[id].date,
            tasks[id].content,
            tasks[id].author,
            tasks[id].done,
            tasks[id].dateCompleted
        );
    }

    function toggleDone(uint256 id) external tasksExists(id) {
        Task storage task = tasks[id];
        task.done = !task.done;
        task.dateCompleted = task.done ? block.timestamp : 0;
        emit TaskStatusToggled(id, task.done, task.dateCompleted);
    }

    modifier tasksExists(uint256 id) {
        if (tasks[id].id == 0) {
            revert();
        }
        _;
    }
}
