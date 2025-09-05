import ffmpeg from '../ffmpeg.js';
import fs from 'node:fs/promises';
import path from 'node:path';
import { describe, expect, it, beforeAll, afterAll } from 'bun:test';

const videos_dir = path.join(process.cwd(), 'videos');
const output_dir = path.join(process.cwd(), 'output');
const watermark = path.join(videos_dir, 'watermark.png');
await fs.mkdir(output_dir, { recursive: true, force: true });

describe('FFMPEG', () => {
    // it('加水印', async () => {
    //     const extensions = ['.mp4', '.mov', '.webm'];
    //     const files = (await fs.readdir(videos_dir, { withFileTypes: true })).filter((p) => p.isFile() && extensions.includes(path.extname(p.name.toLowerCase()))).map((p) => p.name);
    //     for (const file of files) {
    //         const input_file = path.join(videos_dir, file);
    //         let output_file = path.join(output_dir, `watermark.${file}`);
    //         let result = await ffmpeg.addWatermark(input_file, output_file, watermark, {
    //             // silent: false,
    //             position: 'left-top',
    //             margin: 10,
    //             opacity: 0.9,
    //             scale: 0.1,
    //             rotate: 45,
    //         });
    //         expect(result).toBe(path.resolve(output_file));
    //     }
    // });
    // it('提取音频', async () => {
    //     const extensions = ['.mp4', '.mov', '.webm'];
    //     const files = (await fs.readdir(videos_dir, { withFileTypes: true })).filter((p) => p.isFile() && extensions.includes(path.extname(p.name.toLowerCase()))).map((p) => p.name);
    //     const codes = ['mp3', 'aac', 'ac3', 'flac', 'mp2'];
    //     for (const file of files) {
    //         const input_file = path.join(videos_dir, file);
    //         for (const code of codes) {
    //             let output_file = path.join(output_dir, `${file}.${code}`);
    //             let result = await ffmpeg.extractAudio(input_file, output_file, { codec: code });
    //             expect(output_file).toBe(path.resolve(output_file));
    //             expect(await fs.stat(result)).toBeTruthy();
    //         }
    //     }
    // });
    // it('获取视频信息', async () => {
    //     const extensions = ['.mp4', '.mov', '.webm'];
    //     const files = (await fs.readdir(videos_dir, { withFileTypes: true })).filter((p) => p.isFile() && extensions.includes(path.extname(p.name.toLowerCase()))).map((p) => p.name);
    //     for (const file of files) {
    //         const input_file = path.join(videos_dir, file);
    //         let result = await ffmpeg.getVideoInfo(input_file);
    //         expect(result).toBeDefined();
    //     }
    // });
    // it('裁剪视频', async () => {
    //     const extensions = ['.mp4', '.mov', '.webm'];
    //     const files = (await fs.readdir(videos_dir, { withFileTypes: true })).filter((p) => p.isFile() && extensions.includes(path.extname(p.name.toLowerCase()))).map((p) => p.name);
    //     for (const file of files) {
    //         const input_file = path.join(videos_dir, file);
    //         const cropped_output = path.join(output_dir, `cropped.${file}`);
    //         const output = await ffmpeg.cropVideo(input_file, cropped_output, 0, 5);
    //         expect(output).toBe(path.resolve(cropped_output));
    //         expect(await fs.stat(output)).toBeTruthy();
    //     }
    // });
    // it('拼接视频', async () => {
    //     const extensions = ['.mp4', '.mov', '.webm'];
    //     const files = (await fs.readdir(videos_dir, { withFileTypes: true })).filter((p) => p.isFile() && extensions.includes(path.extname(p.name.toLowerCase()))).map((p) => path.join(p.parentPath, p.name));
    //     const concat_output = path.join(output_dir, 'concatenated.mp4');
    //     const output = await ffmpeg.concatVideos(files, concat_output);
    //     expect(output).toBe(path.resolve(concat_output));
    //     expect(await fs.stat(output)).toBeTruthy();
    // });
    // it('拼接视频(转场)', async () => {
    //     const extensions = ['.mp4', '.mov', '.webm'];
    //     const files = (await fs.readdir(videos_dir, { withFileTypes: true })).filter((p) => p.isFile() && extensions.includes(path.extname(p.name.toLowerCase()))).map((p) => path.join(p.parentPath, p.name));
    //     const concat_output = path.join(output_dir, 'concatenated.transition.mp4');
    //     console.log(files);
    //     const output = await ffmpeg.concatVideos(files, concat_output, {
    //         transition_duration: 5,
    //         transition_type: 'fade',
    //         silent: false,
    //     });
    //     expect(output).toBe(path.resolve(concat_output));
    //     expect(await fs.stat(output)).toBeTruthy();
    // });
    // it('should auto cut and concatenate videos', async () => {
    //     const output = await ffmpeg.autoCutVideo(TEST_DIR, TEST_OUTPUT, {
    //         min_sec: 1,
    //         max_sec: 2,
    //         silent: true,
    //     });
    //     expect(output).toBe(path.resolve(TEST_OUTPUT));
    //     expect(await fs.stat(output)).toBeTruthy();
    // }, 30000); // 设置较长的超时时间
});
