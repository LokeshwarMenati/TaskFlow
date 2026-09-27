import request from 'supertest';
import { createApp } from '../app';
import { setupTestDB } from './setup';

setupTestDB();

const app = createApp();

describe('Task Management API', () => {
  let user1Token: string;
  let user2Token: string;

  beforeEach(async () => {
    // Register User 1
    const res1 = await request(app)
      .post('/auth/register')
      .send({ email: 'user1@example.com', password: 'Password123!' });
    user1Token = res1.body.data.token;

    // Register User 2
    const res2 = await request(app)
      .post('/auth/register')
      .send({ email: 'user2@example.com', password: 'Password123!' });
    user2Token = res2.body.data.token;
  });

  describe('Authentication protection', () => {
    it('should reject GET /tasks without token (401)', async () => {
      const res = await request(app).get('/tasks');
      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
    });

    it('should reject POST /tasks without token (401)', async () => {
      const res = await request(app).post('/tasks').send({ title: 'Unauthorized' });
      expect(res.status).toBe(401);
    });
  });

  describe('CRUD Operations and User Scoping Security', () => {
    it('should create a task for user 1 and allow user 1 to read it', async () => {
      const taskData = {
        title: 'User 1 Task',
        description: 'First test task',
        dateTime: '2026-10-01T10:00:00.000Z',
        deadline: '2026-10-02T10:00:00.000Z',
        priority: 'high',
        category: 'Work',
      };

      const createRes = await request(app)
        .post('/tasks')
        .set('Authorization', `Bearer ${user1Token}`)
        .send(taskData);

      expect(createRes.status).toBe(201);
      expect(createRes.body.success).toBe(true);
      expect(createRes.body.data.task.title).toBe(taskData.title);
      expect(createRes.body.data.task.priority).toBe('high');
      expect(createRes.body.data.task.status).toBe('pending');
      expect(createRes.body.data.task.isOverdue).toBe(false);

      const taskId = createRes.body.data.task._id;

      // User 1 reads own tasks
      const listRes = await request(app)
        .get('/tasks')
        .set('Authorization', `Bearer ${user1Token}`);

      expect(listRes.status).toBe(200);
      expect(listRes.body.data.tasks.length).toBe(1);
      expect(listRes.body.data.tasks[0]._id).toBe(taskId);
    });

    it('CRITICAL SECURITY: User 2 must NOT see User 1 tasks in GET /tasks', async () => {
      // User 1 creates a task
      await request(app)
        .post('/tasks')
        .set('Authorization', `Bearer ${user1Token}`)
        .send({
          title: 'User 1 Secret Task',
          dateTime: '2026-10-01T10:00:00.000Z',
          deadline: '2026-10-02T10:00:00.000Z',
        });

      // User 2 requests tasks
      const res2 = await request(app)
        .get('/tasks')
        .set('Authorization', `Bearer ${user2Token}`);

      expect(res2.status).toBe(200);
      expect(res2.body.data.tasks.length).toBe(0); // Zero tasks visible to User 2
    });

    it('CRITICAL SECURITY: User 2 must NOT access, update, or delete User 1 task by ID', async () => {
      // User 1 creates a task
      const createRes = await request(app)
        .post('/tasks')
        .set('Authorization', `Bearer ${user1Token}`)
        .send({
          title: 'User 1 Task to Protect',
          dateTime: '2026-10-01T10:00:00.000Z',
          deadline: '2026-10-02T10:00:00.000Z',
        });

      const taskId = createRes.body.data.task._id;

      // User 2 tries to GET by ID
      const getRes = await request(app)
        .get(`/tasks/${taskId}`)
        .set('Authorization', `Bearer ${user2Token}`);
      expect(getRes.status).toBe(404);

      // User 2 tries to PATCH task
      const patchRes = await request(app)
        .patch(`/tasks/${taskId}`)
        .set('Authorization', `Bearer ${user2Token}`)
        .send({ title: 'Hacked Title' });
      expect(patchRes.status).toBe(404);

      // User 2 tries to DELETE task
      const deleteRes = await request(app)
        .delete(`/tasks/${taskId}`)
        .set('Authorization', `Bearer ${user2Token}`);
      expect(deleteRes.status).toBe(404);

      // Verify User 1's task is still intact
      const verifyRes = await request(app)
        .get(`/tasks/${taskId}`)
        .set('Authorization', `Bearer ${user1Token}`);
      expect(verifyRes.status).toBe(200);
      expect(verifyRes.body.data.task.title).toBe('User 1 Task to Protect');
    });

    it('should update task details and support status toggling', async () => {
      const createRes = await request(app)
        .post('/tasks')
        .set('Authorization', `Bearer ${user1Token}`)
        .send({
          title: 'Initial Title',
          dateTime: '2026-10-01T10:00:00.000Z',
          deadline: '2026-10-02T10:00:00.000Z',
          priority: 'low',
        });

      const taskId = createRes.body.data.task._id;

      const updateRes = await request(app)
        .patch(`/tasks/${taskId}`)
        .set('Authorization', `Bearer ${user1Token}`)
        .send({
          title: 'Updated Title',
          priority: 'high',
          status: 'completed',
        });

      expect(updateRes.status).toBe(200);
      expect(updateRes.body.data.task.title).toBe('Updated Title');
      expect(updateRes.body.data.task.priority).toBe('high');
      expect(updateRes.body.data.task.status).toBe('completed');
    });

    it('should delete task and confirm it is gone', async () => {
      const createRes = await request(app)
        .post('/tasks')
        .set('Authorization', `Bearer ${user1Token}`)
        .send({
          title: 'Task to be deleted',
          dateTime: '2026-10-01T10:00:00.000Z',
          deadline: '2026-10-02T10:00:00.000Z',
        });

      const taskId = createRes.body.data.task._id;

      const deleteRes = await request(app)
        .delete(`/tasks/${taskId}`)
        .set('Authorization', `Bearer ${user1Token}`);

      expect(deleteRes.status).toBe(200);

      // Verify 404 on subsequent get
      const getRes = await request(app)
        .get(`/tasks/${taskId}`)
        .set('Authorization', `Bearer ${user1Token}`);
      expect(getRes.status).toBe(404);
    });
  });

  describe('Filtering and Sorting', () => {
    beforeEach(async () => {
      // Create a set of varied tasks for user 1
      await request(app).post('/tasks').set('Authorization', `Bearer ${user1Token}`).send({
        title: 'Work Urgent',
        dateTime: '2026-10-01T09:00:00.000Z',
        deadline: '2026-10-01T17:00:00.000Z',
        priority: 'high',
        category: 'Work',
      });

      await request(app).post('/tasks').set('Authorization', `Bearer ${user1Token}`).send({
        title: 'Work Normal',
        dateTime: '2026-10-05T09:00:00.000Z',
        deadline: '2026-10-06T17:00:00.000Z',
        priority: 'medium',
        category: 'Work',
      });

      const compRes = await request(app).post('/tasks').set('Authorization', `Bearer ${user1Token}`).send({
        title: 'Personal Completed',
        dateTime: '2026-09-20T09:00:00.000Z',
        deadline: '2026-09-21T17:00:00.000Z',
        priority: 'low',
        category: 'Personal',
      });
      await request(app).patch(`/tasks/${compRes.body.data.task._id}`).set('Authorization', `Bearer ${user1Token}`).send({
        status: 'completed',
      });
    });

    it('should filter by status', async () => {
      const pendingRes = await request(app)
        .get('/tasks?status=pending')
        .set('Authorization', `Bearer ${user1Token}`);
      expect(pendingRes.body.data.tasks.length).toBe(2);

      const completedRes = await request(app)
        .get('/tasks?status=completed')
        .set('Authorization', `Bearer ${user1Token}`);
      expect(completedRes.body.data.tasks.length).toBe(1);
      expect(completedRes.body.data.tasks[0].title).toBe('Personal Completed');
    });

    it('should filter by priority', async () => {
      const highRes = await request(app)
        .get('/tasks?priority=high')
        .set('Authorization', `Bearer ${user1Token}`);
      expect(highRes.body.data.tasks.length).toBe(1);
      expect(highRes.body.data.tasks[0].title).toBe('Work Urgent');
    });

    it('should filter by category', async () => {
      const workRes = await request(app)
        .get('/tasks?category=Work')
        .set('Authorization', `Bearer ${user1Token}`);
      expect(workRes.body.data.tasks.length).toBe(2);
    });

    it('should sort by deadline', async () => {
      const res = await request(app)
        .get('/tasks?sort=deadline')
        .set('Authorization', `Bearer ${user1Token}`);

      const deadlines = res.body.data.tasks.map((t: any) => new Date(t.deadline).getTime());
      for (let i = 0; i < deadlines.length - 1; i++) {
        expect(deadlines[i]).toBeLessThanOrEqual(deadlines[i + 1]);
      }
    });

    it('should sort by composite by default', async () => {
      const res = await request(app)
        .get('/tasks?sort=composite')
        .set('Authorization', `Bearer ${user1Token}`);

      expect(res.status).toBe(200);
      // Completed task must be at bottom
      const tasks = res.body.data.tasks;
      expect(tasks[tasks.length - 1].status).toBe('completed');
    });
  });
});
