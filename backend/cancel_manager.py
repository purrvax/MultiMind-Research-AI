import asyncio


_running_tasks = {}


class CancellationError(Exception):
    pass


def create_task(task_id):
    _running_tasks[task_id] = asyncio.Event()
    print(f"task created: {task_id}")


def cancel_task(task_id):
    task = _running_tasks.get(task_id)
    if task:
        task.set()
    print(f"task cancelled: {task_id}")


def is_cancelled(task_id):
    task = _running_tasks.get(task_id)
    return bool(task and task.is_set())


def remove_task(task_id):
    _running_tasks.pop(task_id, None)
    print(f"task removed: {task_id}")
