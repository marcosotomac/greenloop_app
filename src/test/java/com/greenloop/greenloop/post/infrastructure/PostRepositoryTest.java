package com.greenloop.greenloop.post.infrastructure;

import com.greenloop.greenloop.User.domain.User;
import com.greenloop.greenloop.User.infrastructure.UserRepository;
import com.greenloop.greenloop.post.domain.Post;
import com.greenloop.greenloop.post.domain.Wanted;
import com.greenloop.greenloop.post.infraestructure.PostRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.jdbc.AutoConfigureTestDatabase;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.test.context.TestPropertySource;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.boot.test.autoconfigure.jdbc.AutoConfigureTestDatabase.Replace;

@DataJpaTest
@AutoConfigureTestDatabase(replace = Replace.ANY)
@TestPropertySource(properties = {
    "spring.datasource.url=jdbc:h2:mem:testdb",
    "spring.datasource.driverClassName=org.testcontainers.jdbc.ContainerDatabaseDriver",
    "spring.datasource.username=sa",
    "spring.datasource.password=password",
    "spring.jpa.database-platform=org.hibernate.dialect.H2Dialect",
    "spring.jpa.hibernate.ddl-auto=create-drop"
})
public class PostRepositoryTest {

    @Autowired
    private PostRepository postRepository;

    @Autowired
    private UserRepository userRepository;

    private User testUser;
    private Post testPost;

    @BeforeEach
    void setUp() {
        // Create a test user
        testUser = new User();
        testUser.setFirstName("Test");
        testUser.setLastName("User");
        testUser.setEmail("test@example.com");
        testUser.setPassword("password");
        testUser = userRepository.save(testUser);

        // Create a test post
        testPost = new Post();
        testPost.setTitle("Test Post");
        testPost.setContent("This is a test post content");
        testPost.setPublishedAt(LocalDateTime.now());
        testPost.setImageUrl("http://example.com/image.jpg");
        testPost.setWanted(Wanted.DONATION);
        testPost.setLocation("Test Location");
        testPost.setActive(true);
        testPost.setUser(testUser);
        testPost = postRepository.save(testPost);

        // Create a few more posts for testing queries
        for (int i = 0; i < 5; i++) {
            Post post = new Post();
            post.setTitle("Post " + i);
            post.setContent("Content " + i);
            post.setPublishedAt(LocalDateTime.now().minusDays(i));
            post.setImageUrl("http://example.com/image" + i + ".jpg");
            post.setWanted(i % 2 == 0 ? Wanted.DONATION : Wanted.EXCHANGE);
            post.setLocation(i % 2 == 0 ? "Location A" : "Location B");
            post.setActive(i < 4); // Make one post inactive
            post.setUser(testUser);
            postRepository.save(post);
        }
    }

    @Test
    void findAllByOrderByPublishedAtDesc_ShouldReturnAllPostsOrderedByDate() {
        // When
        List<Post> result = postRepository.findAllByOrderByPublishedAtDesc();

        // Then
        assertThat(result).isNotEmpty();
        for (int i = 0; i < result.size() - 1; i++) {
            assertThat(result.get(i).getPublishedAt()).isAfterOrEqualTo(result.get(i + 1).getPublishedAt());
        }
    }

    @Test
    void findByActiveTrue_WithPagination_ShouldReturnOnlyActivePosts() {
        // Given
        PageRequest pageable = PageRequest.of(0, 10, Sort.by("publishedAt").descending());

        // When
        Page<Post> result = postRepository.findByActiveTrue(pageable);

        // Then
        assertThat(result).isNotEmpty();
        assertThat(result.getContent()).allMatch(Post::isActive);
    }

    @Test
    void findByUserIdOrderByPublishedAtDesc_ShouldReturnUserPosts() {
        // When
        List<Post> result = postRepository.findByUserIdOrderByPublishedAtDesc(testUser.getId());

        // Then
        assertThat(result).isNotEmpty();
        assertThat(result).allMatch(post -> post.getUser().getId().equals(testUser.getId()));
        for (int i = 0; i < result.size() - 1; i++) {
            assertThat(result.get(i).getPublishedAt()).isAfterOrEqualTo(result.get(i + 1).getPublishedAt());
        }
    }

    @Test
    void findPostByUserId_ShouldReturnUserPosts() {
        // When
        List<Post> result = postRepository.findPostByUserId(testUser.getId());

        // Then
        assertThat(result).isNotEmpty();
        assertThat(result).allMatch(post -> post.getUser().getId().equals(testUser.getId()));
    }

    @Test
    void findByWantedAndActiveTrue_ShouldReturnPostsOfSpecificType() {
        // When
        List<Post> donationPosts = postRepository.findByWantedAndActiveTrue(Wanted.DONATION);
        List<Post> exchangePosts = postRepository.findByWantedAndActiveTrue(Wanted.EXCHANGE);

        // Then
        assertThat(donationPosts).isNotEmpty();
        assertThat(exchangePosts).isNotEmpty();
        assertThat(donationPosts).allMatch(post -> post.getWanted() == Wanted.DONATION && post.isActive());
        assertThat(exchangePosts).allMatch(post -> post.getWanted() == Wanted.EXCHANGE && post.isActive());
    }

    @Test
    void searchByKeyword_ShouldReturnMatchingPosts() {
        // When
        List<Post> resultByTitle = postRepository.searchByKeyword("Test Post");
        List<Post> resultByContent = postRepository.searchByKeyword("test post content");

        // Then
        assertThat(resultByTitle).isNotEmpty();
        assertThat(resultByContent).isNotEmpty();
        assertThat(resultByTitle).anyMatch(post -> post.getTitle().contains("Test"));
        assertThat(resultByContent).anyMatch(post -> post.getContent().contains("test"));
    }

    @Test
    void findByLocationContainingIgnoreCaseAndActiveTrue_ShouldReturnPostsInLocation() {
        // When
        List<Post> resultLocationA = postRepository.findByLocationContainingIgnoreCaseAndActiveTrue("Location A");

        // Then
        assertThat(resultLocationA).isNotEmpty();
        assertThat(resultLocationA).allMatch(post -> post.getLocation().contains("Location A") && post.isActive());
    }

    @Test
    void existsByPostIdAndUserId_ShouldReturnTrueForUserPost() {
        // When
        boolean exists = postRepository.existsByPostIdAndUserId(testPost.getPostId(), testUser.getId());
        boolean notExists = postRepository.existsByPostIdAndUserId(testPost.getPostId(), -1L);

        // Then
        assertThat(exists).isTrue();
        assertThat(notExists).isFalse();
    }

    @Test
    void findByPostIdAndActive_ShouldReturnActivePost() {
        // When
        Optional<Post> found = postRepository.findByPostIdAndActive(testPost.getPostId(), true);

        // Then
        assertThat(found).isPresent();
        assertThat(found.get().getPostId()).isEqualTo(testPost.getPostId());
        assertThat(found.get().isActive()).isTrue();
    }
}
