import 'package:flutter/material.dart';
import 'package:video_player/video_player.dart';

class MediaView extends StatefulWidget {
  final String url;
  final bool isVideo;
  final double height;

  const MediaView({
    super.key,
    required this.url,
    required this.isVideo,
    this.height = 300,
  });

  @override
  State<MediaView> createState() => _MediaViewState();
}

class _MediaViewState extends State<MediaView> {
  VideoPlayerController? _controller;
  bool _isMuted = true;
  bool _isInitialized = false;

  @override
  void initState() {
    super.initState();
    if (widget.isVideo) {
      _initializeVideo();
    }
  }

  @override
  void didUpdateWidget(covariant MediaView oldWidget) {
    super.didUpdateWidget(oldWidget);
    if (widget.url != oldWidget.url || widget.isVideo != oldWidget.isVideo) {
      _controller?.dispose();
      _controller = null;
      _isInitialized = false;
      if (widget.isVideo) {
        _initializeVideo();
      }
    }
  }

  Future<void> _initializeVideo() async {
    final controller = VideoPlayerController.network(widget.url);
    await controller.initialize();
    controller.setVolume(_isMuted ? 0 : 1);
    // KHÔNG autoPlay và KHÔNG loop theo yêu cầu
    if (mounted) {
      setState(() {
        _controller = controller;
        _isInitialized = true;
      });
    }
  }

  void _toggleMute() {
    setState(() {
      _isMuted = !_isMuted;
      _controller?.setVolume(_isMuted ? 0 : 1);
    });
  }

  @override
  void dispose() {
    _controller?.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    if (!widget.isVideo) {
      return Container(
        height: widget.height,
        width: double.infinity,
        decoration: BoxDecoration(borderRadius: BorderRadius.circular(8)),
        clipBehavior: Clip.hardEdge,
        child: Image.network(
          widget.url,
          fit: BoxFit.cover,
          loadingBuilder: (context, child, loadingProgress) {
            if (loadingProgress == null) return child;
            return const Center(child: CircularProgressIndicator());
          },
        ),
      );
    }

    return Container(
      height: widget.height,
      width: double.infinity,
      decoration: BoxDecoration(borderRadius: BorderRadius.circular(8)),
      clipBehavior: Clip.hardEdge,
      child: Stack(
        fit: StackFit.expand,
        children: [
          _isInitialized && _controller != null
              ? AspectRatio(
            aspectRatio: _controller!.value.aspectRatio,
            child: VideoPlayer(_controller!),
          )
              : const Center(child: CircularProgressIndicator()),

          // Nút Play/Pause để điều khiển
          if (_controller != null && _isInitialized)
            GestureDetector(
              onTap: () {
                setState(() {
                  _controller!.value.isPlaying
                      ? _controller!.pause()
                      : _controller!.play();
                });
              },
              child: Container(color: Colors.transparent),
            ),

          // Nút bật/tắt âm thanh
          if (_controller != null)
            Positioned(
              bottom: 12,
              right: 12,
              child: GestureDetector(
                onTap: _toggleMute,
                child: Container(
                  decoration: BoxDecoration(
                    color: Colors.black45,
                    borderRadius: BorderRadius.circular(20),
                  ),
                  padding: const EdgeInsets.all(8),
                  child: Icon(
                    _isMuted ? Icons.volume_off : Icons.volume_up,
                    color: Colors.white,
                    size: 24,
                  ),
                ),
              ),
            ),
        ],
      ),
    );
  }
}
